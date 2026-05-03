# [STORY] Admin configures cancellation / refund / reschedule policy

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As an admin, I can configure a single global Policy in PayloadCMS — controlling free-cancel window, late-cancel behavior, no-show behavior, and reschedule rules — and the customer-facing booking flow reflects it consistently.

## Acceptance Criteria

- [ ] PayloadCMS Policy collection with one global row per tenant. Fields:
  - `freeCancelHours: number` (e.g., 24)
  - `lateCancelBehavior: 'credit' \| 'none'` (after the free window)
  - `noShowBehavior: 'charged' \| 'refundable' \| 'partial'`
  - `freeRescheduleHours: number`
  - `maxReschedules: number`
- [ ] **Hard rule (NOT configurable):** refund destination always returns to source — card portion → card, pack portion → pack credit, gift-card portion → gift-card balance.
- [ ] Pilot ships with sensible defaults pre-seeded: `freeCancelHours = 24`, `lateCancelBehavior = 'credit'`, `noShowBehavior = 'charged'`, `freeRescheduleHours = 24`, `maxReschedules = 2`.
- [ ] Schema is keyed by a `scope` field (default `'global'`), so per-service overrides become a second row in V1 — **no migration**.
- [ ] Policy changes apply to bookings created **after** the change; existing bookings retain the policy snapshot from when they were created (`Booking.policyId` foreign key + immutability).
- [ ] Customer-facing booking confirmation page and confirmation email both display the applicable policy in plain language ("Free cancellation up to 24h before…").

## Specs

- [ ] `specs/policy-collection.md` — schema, validation, immutability rules
- [ ] `specs/policy-snapshot-on-booking.md` — how `Booking.policyId` is set + why policies aren't mutated in place
- [ ] `specs/policy-display-strings.md` — i18n strings for surfacing policy in customer-facing copy

## Out of Scope (for this Story)

- Per-service or per-product policy overrides UI (data model supports it; UI ships single global policy).
- Policy A/B testing.
- Policy version history UI (audit log only in V0).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Default policy seeded on tenant creation; admin can edit and changes take effect for new bookings within 60s.
- [ ] Policy snapshot test: changing the global Policy does not change refund behavior for an existing `confirmed` booking.
- [ ] Policy text rendered in both FR and EN.
