# [STORY] Book as guest, pay by card / Apple Pay / Google Pay

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As a guest visitor on my phone, I can pick a service → practitioner → slot → pay by card / Apple Pay / Google Pay on **one screen**, in **under 60 seconds**, without creating an account.

## Acceptance Criteria

- [ ] Landing on `book.<merchant>.com` shows the service picker as the first interactive element above the fold (mobile 320px+).
- [ ] After picking a service, the practitioner picker appears (or auto-selects if the service has only one eligible practitioner).
- [ ] After picking a practitioner (or none if the service is room-only), the slot picker shows the next 14 days of available slots in the merchant's configured timezone, expressed in the visitor's local time.
- [ ] Selecting a slot reveals the customer-info form (name, email, phone) and the Stripe Payment Element on the same screen — no page navigation.
- [ ] Apple Pay / Google Pay tiles render when supported by the browser/device, surfaced above the card form.
- [ ] Confirming payment debits the card (or Apple/Google Pay) and creates a `confirmed` Booking with the correct service, practitioner, room, and start time.
- [ ] On payment success, the user sees a confirmation screen with booking details and "add to calendar" links (Apple, Google, ICS).
- [ ] On payment failure, the user sees a clear error and can retry without losing slot reservation (15-min hold).
- [ ] No Shopify cart, no shipping address, no marketing-opt-in, no account-creation prompt is ever shown.
- [ ] Touch targets ≥ 44×44px.

## Specs

To be created via `/spec` once this Story is Ready:

- [ ] `specs/hosted-booking-checkout-ui.md` — UI flow, component breakdown, state machine
- [ ] `specs/slot-availability-api.md` — endpoint contract, performance budget, caching strategy
- [ ] `specs/stripe-payment-element-integration.md` — PaymentIntent lifecycle, Apple/Google Pay setup, error handling
- [ ] `specs/slot-reservation-and-expiry.md` — 15-min hold mechanics, race-safe acquisition

## Out of Scope (for this Story)

- Pack-credit redemption (covered by `redeem-pack-credit.md`).
- Reschedule / cancel (covered by `customer-cancel-or-reschedule.md`).
- Email notifications (covered by `confirmation-and-reminder-emails.md`).
- Any admin-side configuration (separate Stories).
- A/B testing harness (covered by `checkout-ab-test-flag.md`).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Tested at 320px mobile, validated on iOS Safari + Android Chrome.
- [ ] PostHog funnel events (`slot_viewed`, `slot_selected`, `checkout_loaded`, `payment_submitted`, `payment_succeeded`, `payment_failed`) firing with correct payload.
- [ ] Sentry integration verified — synthetic error reaches Sentry within 30s.
- [ ] Time-to-confirm benchmark: **median < 45s**, **p95 < 75s** on a mid-range Android over 4G.
- [ ] No double-booking incident in load test (100 concurrent visitors competing for 10 slots).
