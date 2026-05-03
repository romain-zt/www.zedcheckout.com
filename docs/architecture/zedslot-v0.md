# Architecture — zedslot V0

> Cross-cutting architecture for the V0 booking pilot.
> Companion to `docs/features/booking-pilot.md`.

## Approach

**A++** — lean SaaS, build from scratch, monorepo from day 1, factor by small reusable units, PayloadCMS for admin, next-forge ethos for cross-cutting concerns (typed feature flags, observability, analytics, design system).

Cal.com (and similar) was rejected: the conversion wedge IS the UX, and Cal.com's UX is the very thing we're competing against. Single-tenant pilot was rejected too: it saves modest engineering up front but creates the worst-timed refactor exactly when we want to onboard customer #2.

## Monorepo layout (Turborepo + pnpm)

```text
zedslot/
├── apps/
│   ├── booking         # hosted checkout — Next.js, public, on book.<merchant>.com
│   ├── admin           # PayloadCMS v3 (Next.js host) — admin.zedslot.com
│   ├── api             # webhook receivers (Stripe, Shopify) + cron jobs (Next.js routes or Hono)
│   ├── web             # marketing site — current www.zedcheckout.com (this repo)
│   └── docs            # public docs (Fumadocs/Mintlify)
├── packages/
│   ├── domain          # pure TS: entities, value objects, invariants. Zero infra deps.
│   ├── booking-engine  # availability calc, slot generation, conflict resolution. Pure functions over `domain`.
│   ├── shopify         # Customer Account API + Admin API + webhook signature verify
│   ├── payments        # Stripe wrapper: PaymentIntent, refund-to-source, split-source orchestration
│   ├── database        # Drizzle schema + migrations + tenant-scoped query helpers
│   ├── auth            # customer magic-link auth (booking subdomain); admin auth handled by Payload
│   ├── ui              # shadcn primitives + CVA variants; SlotPicker, PaymentMethodTile, etc.
│   ├── feature-flags   # typed flags (PostHog-backed), evaluated server-side
│   ├── email           # React Email templates + Resend sender
│   ├── observability   # Sentry + structured logger
│   ├── analytics       # PostHog wrapper, typed conversion events
│   └── config          # shared tsconfig, eslint, tailwind, prettier
└── tooling/            # codegen scripts, db migration runner, seed scripts
```

> **Migration note:** the current `www.zedcheckout.com` repo (Next.js 14 marketing site) becomes `apps/web` inside the monorepo at the migration step. The PRD does not require this migration to ship V0 — `apps/booking`, `apps/admin`, `apps/api` can be built in a fresh monorepo and the marketing site folded in later. Decision deferred to the implementation plan.

### Key invariant — dependency isolation

`domain` and `booking-engine` have **zero infrastructure dependencies** — no DB, no Stripe, no Next.js. Every other package depends on `domain`; **no package depends on apps**. This makes the booking brain unit-testable, AI-navigable, and replaceable without touching infra code.

**Every external SDK is wrapped in a dedicated package** (Stripe → `packages/payments`, Shopify → `packages/shopify`, Resend → `packages/email`, PostHog → `packages/feature-flags` + `packages/analytics`, Drizzle → `packages/database`, Sentry → `packages/observability`). Apps and other packages may only import the wrapper, never the underlying SDK directly. The wrapper exposes a small, stable, project-owned interface so swapping a vendor is a one-package change.

**UI uses design tokens, never hardcoded values.** All colors, spacing, typography, shadows, radii come from `packages/ui`. Tailwind arbitrary-value classes are forbidden for design tokens.

This is enshrined as a non-negotiable rule: `.cursor/rules/core/dependency-isolation.mdc`.

## Domain model (the words)

Pure-TS entities live in `packages/domain`. **Naming locked — used everywhere identically.**

| Entity | Shape (sketch) |
|---|---|
| **Tenant** | `{ id, slug, displayName, timezone, defaultLocale, locales[], branding }` |
| **Service** | `{ id, tenantId, name (i18n), durationMinutes, priceCents, eligibleResourceIds[], eligibleRoomIds[], requiresResource, requiresRoom, status }` |
| **Resource** | `{ id, tenantId, name, email, status }` (a practitioner) |
| **Room** | `{ id, tenantId, name, bookableWithoutResource, status }` |
| **AvailabilityRule** | `{ id, tenantId, scope: 'resource:<id>' \| 'room:<id>', kind: 'recurring' \| 'override', dayOfWeek?, startTime, endTime, dateRange? }` |
| **Slot** | computed, not stored: `{ tenantId, serviceId, resourceId?, roomId, startsAt, endsAt }` |
| **Booking** | `{ id, tenantId, serviceId, resourceId?, roomId, startsAt, endsAt, customerId, status, paymentId, policyId, rescheduleCount, createdAt }` |
| **Customer** | `{ id, tenantId, shopifyCustomerId?, email, displayName, packCreditCents (cached), giftCardBalanceCents (cached) }` |
| **Payment** | `{ id, tenantId, bookingId, stripePaymentIntentId?, paidByCardCents, paidByPackCents, paidByGiftCardCents, status }` |
| **Refund** | `{ id, tenantId, paymentId, refundedToCardCents, refundedToPackCents, refundedToGiftCardCents, reason, status, requestedAt, completedAt }` |
| **Policy** | `{ id, tenantId, scope: 'global' \| 'service:<id>', freeCancelHours, lateCancelBehavior: 'credit' \| 'none', noShowBehavior: 'charged' \| 'refundable' \| 'partial', freeRescheduleHours, maxReschedules }` |

**Booking statuses:** `pending` (held while payment confirms) → `confirmed` (paid) → `cancelled` / `completed` / `no_show`.
**Payment statuses:** `requires_action` → `processing` → `succeeded` / `failed` / `refunded` / `partially_refunded`.

## Booking engine (the brain)

`packages/booking-engine` exposes pure functions:

```ts
listAvailableSlots(
  service: Service,
  dateRange: { from: Date; to: Date },
  resources: Resource[],
  rooms: Room[],
  existingBookings: Booking[],
  availabilityRules: AvailabilityRule[],
  tz: string,
): Slot[]

canBook(slot: Slot, existingBookings: Booking[]): Result<true, ConflictReason>

applyPolicy(booking: Booking, policy: Policy, now: Date): CancellationOutcome

splitRefund(payment: Payment, totalToRefundCents: number, allocation: 'card-first' | 'pack-first'): Refund
```

Every function is pure over inputs. All persistence happens in the app/api layer. Easy to property-test (e.g., `forall (b1, b2) ∈ confirmed bookings . not (b1.room === b2.room && overlap(b1, b2))`).

## Concurrency: zero double-bookings

Two layers of defense:

### 1. Database constraint (the real defense)

Postgres `EXCLUDE` with `tstzrange` and a `gist` index:

```sql
ALTER TABLE bookings ADD CONSTRAINT no_room_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    room_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'confirmed');

ALTER TABLE bookings ADD CONSTRAINT no_resource_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    resource_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'confirmed' AND resource_id IS NOT NULL);
```

Race-proof by construction. Two simultaneous confirms → one commits, the other gets a constraint violation → API returns 409 → UI offers next available slot.

### 2. Application pre-check (UX layer)

`canBook` runs at slot-pick time and again at payment-confirm time to give a friendly error **before** the Stripe charge attempts. The DB constraint is the safety net for races that beat the pre-check.

## Payment orchestration: split-source (card + pack)

Two-phase to avoid inconsistent state:

1. **Reserve**
   - Create `Booking(status='pending')`.
   - Reserve pack credit: decrement available balance in `customers.pack_credit_cents`, write `pack_holds` row with `expires_at = now + 15min`.
2. **Charge card** (if any card portion)
   - Stripe `PaymentIntent.create({ amount: cardPortionCents, ... })` then `confirm`.
   - **Success** → confirm booking (status `confirmed`), promote pack hold to actual debit, release hold row, queue Shopify order writeback, queue confirmation email.
   - **Failure** → release pack hold (re-credit `customers.pack_credit_cents`), mark booking `cancelled`, surface error to user.
3. **Hold expiry** — background job releases expired holds for any booking still `pending` after 15 min.

Refunds reverse this:

- A `Refund` row is created atomically (DB transaction).
- Stripe refund call happens via a worker queue (queued, retried on failure with exponential backoff and admin alert after N failures).
- Pack credit increment happens in the same transaction as the `Refund` row creation (no risk of losing it to a Stripe outage).

## Multi-tenancy (cheap now, valuable later)

- **`tenant_id` UUID** on every business-data table (services, resources, rooms, bookings, customers, payments, refunds, policies, holds).
- All Drizzle queries go through `tenantScopedDb(tenantId)` wrapper that enforces the predicate. Direct `db` access is forbidden by an ESLint rule (`no-restricted-imports` + custom rule).
- **Single Little Biceps tenant seeded in V0**; no tenant onboarding UI; tenant resolved from request hostname (`book.littlebiceps.com → tenant_id=<little-biceps>`).
- **V1 extraction** = build the tenant onboarding UI + DNS provisioning + Stripe Connect. **Schema migration: zero.**

## Shopify integration

`packages/shopify` exposes a small surface that hides Shopify churn:

```ts
getCustomerByEmail(email: string): Promise<ShopifyCustomer | null>          // Customer Account API
getCustomerCredit(customerId: string): Promise<{ packCreditCents: number; giftCardBalanceCents: number }>
setCustomerCredit(customerId: string, newBalanceCents: number, idempotencyKey: string): Promise<void>  // metafield write
createOrder(input: CreateOrderInput): Promise<ShopifyOrder>                  // Admin API
verifyWebhookSignature(payload: string, header: string, secret: string): boolean
```

### Failure-mode policy — graceful degradation

If Shopify Admin API is down at booking-confirm time:

- **Booking is still confirmed** (zedslot is the source of truth for the booking — Shopify is a downstream sink).
- **Order writeback is queued**, retried with exponential backoff.
- **Admin gets a Sentry alert** if queue depth exceeds threshold.
- **Pack credit reads cached for 5 min** during outage; **pack redemption disabled** if cache is empty AND API is down (feature flag flip; user sees "Pack redemption temporarily unavailable, please pay by card").

## Admin (PayloadCMS v3)

Payload runs in `apps/admin`, shares the same Postgres via the Drizzle adapter (Payload v3 supports Drizzle natively). Collections map 1:1 to domain entities. Custom blocks for:

- **Calendar view** of bookings (admin can filter by resource, room, status; drag-to-reschedule in V1).
- **Availability editor** (visual weekly grid).
- **Policy editor** (form bound to `Policy` entity).
- **Customer view** (shows pack credit, booking history, manual credit adjustment with audit trail).

Payload's RBAC handles "admin can do everything" out of the box. Practitioner role (read-own-bookings + edit-own-availability) wired in V1 when self-service availability ships.

## Auth

- **Booking subdomain (customer-facing)** — `packages/auth` provides email magic-link auth (one-tap, no password). Triggered only when the customer wants to redeem pack credit. Card-paying customers never see auth.
- **Admin (PayloadCMS)** — Payload's built-in auth (email + password + optional 2FA).
- **Practitioner login** — V1, scoped via Payload roles.
- **Shopify Customer Account API** — used as a *lookup* for pack/gift-card balance after magic-link auth completes (customer email → Shopify customer record). Not used as the auth provider in V0 (too much integration risk; Shopify Customer Account API is still maturing).

## Feature flags (`packages/feature-flags`)

Typed flags evaluated server-side, passed to client via Next.js layout. Backend: PostHog (free tier sufficient for pilot); fallback to static env config for offline/CI.

### V0 flag inventory

| Flag | Type | Purpose |
|---|---|---|
| `checkout_variant` | `'classic' \| 'experimental'` | A/B-test variants of the +48% wedge |
| `payment_method_order` | `'apple_first' \| 'card_first' \| 'pack_first_if_available'` | Reorder payment methods to optimize conversion |
| `pack_redemption_enabled` | `boolean` | Kill switch — flips off if Shopify outage |
| `customer_account_auth_provider` | `'magic_link_email' \| 'shopify'` | Default `magic_link_email`; future toggle to Shopify Customer Account API as the auth provider when it matures (V1+) |
| `language_default` | `'fr' \| 'en'` | Default language at first visit |
| `experimental_room_only_renting` | `boolean` | Gate the room-rental UI even though engine supports it |
| `notifications_email_reminder_hours` | `number` | Hours before slot to send reminder |

Flag evaluation is **server-side only**; client receives boolean/string values, never the flag definitions.

## Observability + analytics

- **Sentry** in every app + `apps/api` worker — required for a payment-handling product. PII scrubbed at the SDK level.
- **PostHog** — funnel events with locked names: `slot_viewed`, `slot_selected`, `checkout_loaded`, `payment_method_chosen`, `payment_submitted`, `payment_succeeded`, `payment_failed`, `booking_confirmed`, `booking_cancelled`. Stored in `packages/analytics` as **typed event builders** so a typo never makes it to prod.
- **Structured logging** — `packages/observability` exports `logger.with({ tenantId, bookingId, traceId })` for correlation across booking → Stripe → Shopify spans.

## Testing strategy (will be detailed in writing-plans)

- `packages/domain` and `packages/booking-engine` — **property-based tests** (fast-check). "No two confirmed bookings can overlap" is a property, not just an example.
- `packages/payments` — **contract tests** against Stripe test mode.
- `packages/shopify` — **contract tests** against a Shopify dev store (Little Biceps will spin one up).
- **E2E** — Playwright on `apps/booking` running the smallest-valuable-slice user journey end-to-end on every PR.

## Stack summary

| Concern | Choice | Notes |
|---|---|---|
| Language | TypeScript everywhere | Strict mode |
| Monorepo | Turborepo + pnpm workspaces | Remote cache via Vercel |
| Web framework | Next.js 15 (App Router) | All apps |
| Admin CMS | PayloadCMS v3 | Drizzle adapter |
| Database | Postgres (Neon) + Drizzle ORM | Branching for preview envs |
| Payments | Stripe (Payment Element) | Apple Pay + Google Pay first |
| Auth (customer) | Magic-link email | Triggered only for pack redemption |
| Auth (admin) | Payload built-in | Optional 2FA |
| UI | shadcn/ui + Tailwind + class-variance-authority | Headless primitives + CVA variants |
| Email | React Email + Resend | Templates in `packages/email` |
| Feature flags | PostHog (evaluation) | Wrapped in `packages/feature-flags` |
| Observability | Sentry + structured logger | PII scrubbing at SDK level |
| Analytics | PostHog | Typed event builders |
| Hosting | Vercel for `apps/*`; Neon for Postgres; PostHog Cloud; Resend; Sentry SaaS | All standard SaaS — no infra ops |
| CI | GitHub Actions; Turborepo remote cache | PR previews via Vercel |
| Inspiration | next-forge.com | Especially for monorepo structure + feature flags pattern |
