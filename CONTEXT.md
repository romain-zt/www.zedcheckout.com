# CONTEXT

The shared domain language for **zedslot** (booking) and the broader **zedcheckout** SaaS umbrella. Agents working in this repo MUST use these terms consistently.

## Product

- **Name:** zedcheckout (SaaS umbrella) / zedslot (V0 booking product)
- **One-liner:** Hosted checkout + booking layer for Shopify merchants who outgrew vanilla checkout but can't justify $30k/yr Shopify Plus.
- **Stage:** PRD (V0 design phase, pre-implementation)
- **URL:** `www.zedcheckout.com` (marketing); `book.<merchant-domain>` (V0 booking subdomain via CNAME — pilot: `book.littlebiceps.com`); `<merchant>.zedslot.com` (fallback)

## Language

**Tenant**:
A merchant using zedslot. One Shopify shop = one tenant. Multi-tenant-aware schema from day 1; only Little Biceps in V0 prod.
_Avoid_: client, account, customer (those are different things — see below)

**Service**:
A bookable offering (e.g., "60-min Renata França drainage"). Has duration, price, eligible practitioners, eligible rooms.
_Avoid_: product, treatment, offering

**Resource**:
A practitioner (Oriane, Emmanuelle, Iris, Stéphanie at Little Biceps). Has working hours and time off.
_Avoid_: staff, employee, agent (in the work-context sense), provider

**Room**:
A physical space inside a tenant's location. Can be bookable without a resource (room renting).
_Avoid_: cabin, space, table, suite

**Slot**:
A candidate time window for a Service. Computed (not stored) from availability rules + existing bookings.
_Avoid_: appointment slot, time window, opening

**Booking**:
A confirmed reservation for a Slot, by a Customer, paid for. Has a status (`pending` → `confirmed` → `cancelled` / `completed` / `no_show`).
_Avoid_: appointment, reservation, order

**Customer**:
The end-user buying the booking (e.g., a Little Biceps client). Mirrors the Shopify customer record. Has a Shopify customer ID, email, pack credit balance, gift-card balance.
_Avoid_: client, user, buyer, shopper

**AvailabilityRule**:
A rule defining when a Resource or Room is available. Either `recurring` (e.g., Mon-Fri 9-18) or `override` (e.g., 2026-08-12 to 2026-08-26 unavailable). Override always wins.
_Avoid_: schedule, calendar entry, time off (use `override` for the unavailable kind)

**Policy**:
The cancellation / refund / no-show / reschedule rules. One global per tenant in V0 (per-service in V1+). Snapshotted on Booking creation (`Booking.policyId`); editing the global Policy does not retroactively change existing bookings.
_Avoid_: terms, rules, settings

**Pack**:
Prepaid credit a Customer buys (e.g., €550 → €600 credit). Redeemable at booking checkout. In V0, source-of-truth is Shopify (metafield + gift card API); in V0.1, source-of-truth becomes zedslot.
_Avoid_: credit pack, store credit, voucher (gift card is its own thing)

**Gift Card**:
A separate prepaid credit instrument, typically gifted. Lives in Shopify's gift card system. Redeemable at booking checkout alongside Pack credit.
_Avoid_: voucher, coupon (coupons/discounts are V0.1)

**Hosted Checkout**:
The booking subdomain (`book.<merchant>.com`). Mobile-first, no Shopify cart, guest-by-default. The wedge of the product.
_Avoid_: checkout page, payment page, booking page

**Wedge**:
The four ingredients that produced Little Biceps' +48% conversion lift: (1) no Shopify cart, (2) custom Stripe payment UI, (3) guest checkout by default, (4) mobile-first. Each independently necessary; together sufficient.
_Avoid_: USP, differentiator, secret sauce

## Relationships

- A **Tenant** has many **Services**, **Resources**, **Rooms**, **Customers**, **Bookings**, and exactly one global **Policy** (in V0).
- A **Service** has many eligible **Resources** and many eligible **Rooms**, and zero or one `requiresResource` / `requiresRoom` flag.
- A **Resource** has many **AvailabilityRules** (`scope = 'resource:<id>'`).
- A **Room** has many **AvailabilityRules** (`scope = 'room:<id>'`) and a `bookableWithoutResource` flag.
- A **Booking** belongs to exactly one **Service**, zero or one **Resource**, exactly one **Room**, exactly one **Customer**, exactly one **Policy** (snapshot), exactly one **Payment**.
- A **Customer** has many **Bookings**, a **Pack** balance (cents), and a **Gift Card** balance (cents).
- A **Payment** can be split across card / **Pack** / **Gift Card** sources; a **Refund** mirrors the same split (refund-to-source is a hard rule).

## Example dialogue

> **Dev:** "When a **Customer** books a **Slot** for a Service that requires a **Resource**, do we lock both the Resource and the **Room**?"
> **Domain expert:** "Both. The Postgres `EXCLUDE` constraint covers both dimensions. If the Service is room-only (no Resource required), only the Room is locked."

> **Dev:** "If we change the global **Policy**, do existing **Bookings** get the new cancellation window?"
> **Domain expert:** "No. **Policy** is snapshotted on Booking creation via `policyId`. Editing the global Policy applies only to new Bookings."

## Flagged ambiguities

- "Customer" was originally used for both end-users (Little Biceps clients) and merchants (Little Biceps itself). **Resolved:** end-user = **Customer**; merchant = **Tenant**.
- "Booking" vs "appointment" vs "reservation" — pick one term, drop others. **Chosen:** **Booking**.
- "Pack" vs "credit pack" vs "store credit" — **Chosen:** **Pack** (with **Gift Card** as the distinct sibling).

## Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict) everywhere |
| Monorepo | Turborepo + pnpm workspaces |
| Web framework | Next.js 15 (App Router) |
| Admin CMS | PayloadCMS v3 |
| Database | Postgres (Neon) + Drizzle ORM |
| Payments | Stripe (Payment Element) — wrapped in `packages/payments` |
| Auth (customer) | Magic-link email — wrapped in `packages/auth` |
| Auth (admin) | Payload built-in |
| UI | shadcn/ui primitives + Tailwind + class-variance-authority — `packages/ui` |
| Email | React Email + Resend — wrapped in `packages/email` |
| Feature flags | PostHog evaluation — wrapped in `packages/feature-flags` |
| Observability | Sentry — wrapped in `packages/observability` |
| Analytics | PostHog — wrapped in `packages/analytics` |
| Hosting | Vercel for `apps/*`; Neon for Postgres; PostHog Cloud; Resend; Sentry SaaS |
| CI | GitHub Actions; Turborepo remote cache |

## Key Constraints

- **Dependency isolation is non-negotiable** — see `.cursor/rules/core/dependency-isolation.mdc`. Every external SDK is wrapped; `packages/domain` and `packages/booking-engine` are pure TS with zero deps.
- **External docs first, hallucination never** — see `.cursor/rules/core/external-docs.mdc`. Authoritative URLs for every dep curated in `docs/references.md`.
- **No Shopify dependency in the user-visible booking flow** — we own the checkout. Shopify is a downstream sink for orders + a read source for Customer/Pack data in V0.
- **Multi-tenant from day 1**, even though only Little Biceps ships in V0 prod. `tenant_id` on every row, every query, every join.
- **Race-proof booking** — Postgres `EXCLUDE` constraints are the safety net; app-layer pre-checks are UX only.
- **Refund-to-source is a hard rule** — never configurable, never lossy.
- **Internal docs vs public copy:** internal docs (`docs/`, `CONTEXT.md`, `*.mdc` rules) name Shopify and Little Biceps freely. The `www.zedcheckout.com` marketing surface stays deliberately vague — never names Shopify or specific customers in public copy.

## Architecture Decisions

1. **Approach A++** — lean SaaS built from scratch in a Turborepo monorepo, factored into small reusable packages, PayloadCMS for admin, next-forge ethos (typed feature flags, Sentry, PostHog, React Email, shadcn). See `docs/architecture/zedslot-v0.md`.
2. **Cal.com rejected** — the conversion wedge IS the UX, and Cal.com's UX is what we're competing against.
3. **Single-tenant-pilot rejected** — `tenant_id` from day 1; the multi-tenant tax is cheap now and ruinously expensive at customer #2.
4. **Magic-link auth (customer) chosen over Shopify Customer Account API in V0** — Customer Account API is used for Pack/gift-card balance lookup only; auth provider is magic-link; flag-controlled fallback if Customer Account API breaks.

## Current Priorities

1. **NOW** — V0 booking pilot for Little Biceps. PRD drafted (`docs/`); specs next via `/spec`; implementation next via `/implement`.
2. **NEXT** — V0.1 native loyalty + Pack + discount + in-store credit (replaces Froonze pain).
3. **DEFERRED** — V1 multi-tenant SaaS extraction (tenant onboarding UI, CNAME provisioning, Stripe Connect, practitioner self-service); V2 product checkout; V3 headless CMS; V∞ standalone Shopify alternative.
