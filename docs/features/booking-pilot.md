# [FEATURE] Booking & hosted checkout for Little Biceps (V0)

> One file per Feature. Lives in `docs/features/`.
> A Feature is a big capability. Decomposes into Stories.

## Meta
- **Status:** Proposed → Active on PRD approval
- **Classification:** **2. Project Primitive** — built for one named pilot (Little Biceps), but with a multi-tenant-aware schema so V1 extraction is cheap. Not yet a Reusable Primitive (that's V1, after we've validated the wedge with one paying customer).
- **Vision link:** `docs/vision.md` — the wedge + primary user.
- **Architecture:** `docs/architecture/zedslot-v0.md` — full technical architecture (monorepo, packages, data model, concurrency, integrations).
- **Owner:** Romain Piveteau
- **Created:** 2026-05-03

## Problem

Little Biceps converts visitors to bookings through Shopify + BookThatApp. The flow is multi-step, mobile-hostile, forces account creation, and routes through the standard Shopify cart — all of which leak conversions and frustrate regulars who already have prepaid pack credit. A hacked custom checkout already proved a **+48% conversion lift**, but it's a fragile patch on top of the existing stack and doesn't solve booking management, pack redemption at booking time, or refund handling.

## Outcome

Visitors land on a hosted booking subdomain (`book.littlebiceps.com`), pick a service → practitioner → slot → pay (card, Apple Pay, Google Pay, or pack credit) on a single mobile-first screen as a guest, get an instant confirmation email, and the booking is reflected in Shopify (order + customer record) so the rest of the merchant's stack (loyalty, accounting, exports) keeps working. Admin manages services, resources, rooms, availability, policies, and bookings in PayloadCMS. Practitioners' calendars are admin-managed in V0.

## Smallest Valuable Slice

> **As a returning Little Biceps customer on my phone, I can book a 60-min drainage with Oriane next Tuesday at 3pm and pay with my pack credit, in under 60 seconds, without creating an account.**

Ships this story → wedge is proven, everything else is incremental.

## Stories

### V0 — P0 (must ship for pilot to launch)

| # | Story | Status |
|---|---|---|
| 1 | `stories/book-as-guest-card.md` — As a guest on mobile, I can pick a service → practitioner → slot → pay by card/Apple Pay/Google Pay on one screen, in under 60s. | Draft |
| 2 | `stories/redeem-pack-credit.md` — As a returning customer, I can authenticate via one-tap email magic link to redeem my pack credit (full or split with card). | Draft |
| 3 | `stories/confirmation-and-reminder-emails.md` — As a customer, I receive an instant confirmation email and a reminder before my slot. | Draft |
| 4 | `stories/admin-manage-services.md` — As an admin, I can create/edit/disable Services (name, duration, price, eligible practitioners, eligible rooms, requires-resource flag). | Draft |
| 5 | `stories/admin-manage-resources.md` — As an admin, I can create practitioners, set their working hours and time off. | Draft |
| 6 | `stories/admin-manage-rooms.md` — As an admin, I can create rooms, mark them bookable-without-resource, and set their availability. | Draft |
| 7 | `stories/admin-configure-policy.md` — As an admin, I can configure the global cancellation/refund/no-show/reschedule policy. | Draft |
| 8 | `stories/customer-cancel-or-reschedule.md` — As a customer, I can cancel or reschedule my booking within the configured window; refunds return to source automatically. | Draft |
| 9 | `stories/admin-bookings-and-refunds.md` — As an admin, I can see all bookings, override status, and trigger manual refunds. | Draft |
| 10 | `stories/no-double-booking-guarantee.md` — As the system, I cannot accept two confirmed bookings that conflict on room or resource — even under race. | Draft |

### V0 — P1 (ship before pilot announcement, OK to launch private beta without)

| # | Story | Status |
|---|---|---|
| 11 | `stories/shopify-order-writeback.md` — As the system, when a booking is confirmed, an order + customer is written back to Shopify. | Draft |
| 12 | `stories/checkout-ab-test-flag.md` — As a product owner, I can A/B-test checkout variants behind a feature flag and read the funnel in PostHog. | Draft |
| 13 | `stories/tenant-settings.md` — As an admin, I can set timezone, languages (FR/EN), and shop branding (logo, colors). | Draft |

## Out of Scope (V0)

- Practitioner self-service login & availability UI (V1).
- Group bookings / class capacity > 1 / pro training scheduling (V1).
- Multi-tenant onboarding UI, automated CNAME provisioning, Stripe Connect (V1).
- Native loyalty / discount / credit module replacing Froonze (V0.1 — separate Feature).
- Per-service policy overrides UI (data model supports it; UI ships single global policy).
- SMS / WhatsApp notifications (V0.1 candidate).
- Per-practitioner pricing UI (data model supports it; UI ships single price per service).

## Dependencies

- **Stripe account + Payment Element** integration. Confirm during build whether Little Biceps is on Shopify Payments only or already has a separate Stripe account; if Shopify Payments only, provision a separate Stripe account for the booking subdomain.
- **Shopify Customer Account API** access (read-side only — used to look up pack/gift-card balance after magic-link auth completes; **not** used as the auth provider in V0). Little Biceps must enable headless customer accounts only if we choose this path; if Customer Account API is unavailable or rate-limited, the kill-switch flag falls back to email-only customer identification with manual balance entry by admin.
- **Shopify Admin API** access token with `write_orders`, `write_customers`, `read_customers`, and metafield read/write scopes.
- **DNS access** on `littlebiceps.com` to CNAME `book.` to the hosted booking app.
- **Resend** (or equivalent) for transactional email.
- **Sentry + PostHog** projects.
- **Neon Postgres** database (or equivalent).
- **Vercel** project for `apps/booking`, `apps/admin`, `apps/api`.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pack credit balance drift between Shopify (source of truth in V0) and zedslot | M | H | Read-on-checkout (no caching of balance); idempotent debit via Shopify metafield with idempotency keys; nightly reconciliation job |
| Hosted checkout converts WORSE than current hack | L | H | Feature flag: 50/50 traffic split for first 2 weeks; PostHog funnels monitor lift in real time; instant rollback by flag flip |
| Shopify Customer Account API changes / rate limits | M | M | Wrap in `packages/shopify`; circuit-breaker; degrade to "card only" if Customer Account API is down |
| Stripe payment failure on split payment (pack + card) leaves system in inconsistent state | M | H | Two-phase orchestration: reserve pack credit → confirm card → debit pack on success; release pack credit on card failure (see architecture doc) |
| Double-booking under race (two customers grabbing the same slot) | M | H | Postgres `EXCLUDE` constraints with `tstzrange` on (room_id, time_range) and (resource_id, time_range); transaction-scoped; app-layer pre-check for friendly UX |
| DNS / CNAME setup blocks pilot launch | L | M | Document the exact DNS records up front; provision a fallback `littlebiceps.zedslot.com` so we can ship even if CNAME is delayed |
| Refund-to-source on split bookings has Stripe edge cases (expired card, refund timeout) | M | M | Refund queue with retry + admin alert on persistent failure; manual override path in admin |
| Little Biceps staff resist new admin (PayloadCMS) UX during peak hours | M | M | 1-week dogfood phase before customer cutover; admin walkthrough video; preserve read-only access to BookThatApp during transition |

## Kill Criteria

Stop the pilot if:

- After 2 weeks of 50/50 traffic, the new checkout converts **≥ 10% worse** than the existing hack and we can't identify a fix in 1 week.
- **Shopify Customer Account API can't deliver** the auth + balance flow we need within the V0 build window — escalate to choosing a different auth provider for V0 and defer pack-redemption to V0.1.
- **Pack-redemption reconciliation requires manual intervention more than once a week** in production — signals the integration model is wrong; halt and re-architect before scaling tenants.

## Pilot Success Criteria (measurable, wired into PostHog dashboards on day 1)

### Conversion (the wedge)

- **Booking conversion rate** (`payment_succeeded / slot_viewed`) on the new checkout, measured under the 50/50 traffic flag.
  - **Target:** ≥ baseline of the current hack (i.e., do not regress).
  - **Stretch:** +10% over the current hack (i.e., +63% over BookThatApp).
  - **Kill threshold:** −10% vs the current hack after 2 weeks.

### Pack / credit redemption

- **Pack-redemption attempt rate:** ≥ 60% of returning customers with positive pack balance choose "use credit" at checkout.
- **Pack-redemption success rate:** ≥ 99% (failures = Shopify integration breakage).

### Reliability

- **Payment failure rate:** < 0.5% of submitted payments.
- **Double-booking incidents:** **0** (any single one is a P0 incident, blocks further rollout).
- **Booking-to-Shopify writeback success rate:** ≥ 99.5% within 5 min of confirmation.
- **Reminder email delivery rate:** ≥ 99% (Resend bounce/spam metric).

### Refunds

- **Refund mean time:** < 5 min from request to Stripe refund confirmation.
- **Manual refund intervention rate:** < 1% of refunds.

### Operational health

- **Sentry error rate:** < 1 user-impacting error per 1k sessions on `apps/booking`.
- **API p95 latency:** < 400 ms on the slot-availability endpoint.

### Business

- **Pilot duration:** 6 weeks of live operation post-launch before deciding "ready for V1 / start onboarding customer #2."
- **Pilot commercial outcome:** Little Biceps signs an LOI / written commitment to convert to a paying SaaS customer at V1 GA pricing.

## Definition of "pilot launched"

S1–S10 shipped, dogfooded by Little Biceps staff for 1 week, then 50/50 traffic split with the existing hack behind the `checkout_variant` feature flag for at least 2 weeks before full cutover.
