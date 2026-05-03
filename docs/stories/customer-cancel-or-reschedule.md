# [STORY] Customer cancels or reschedules

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As a customer, I can cancel or reschedule my booking via the link in my confirmation email — within the configured policy window — and refunds are returned to the original source automatically.

## Acceptance Criteria

- [ ] Confirmation and reminder emails contain a "Manage booking" link with a one-tap auth token (signed, expires after first use or 7 days, whichever first).
- [ ] The Manage Booking page shows: booking details, applicable policy snapshot, "Reschedule" button (visible if within `freeRescheduleHours` and below `maxReschedules`), "Cancel" button (always visible; behavior depends on policy + timing).
- [ ] Cancel within free window → full refund queued to source (card → card, pack → pack, split → split). Customer sees confirmation: "Refund of €X to your card / €Y to your pack credit will be processed within 5 minutes."
- [ ] Cancel after free window with `lateCancelBehavior = 'credit'` → full refund as pack credit (card-paid amount converted to credit; pack-paid amount returned to pack as usual). Customer sees: "Your booking has been cancelled and €X has been credited to your account."
- [ ] Cancel after free window with `lateCancelBehavior = 'none'` → booking cancelled, no refund, customer sees clear message.
- [ ] Reschedule within window → atomic operation: new slot is acquired (subject to availability + same conflict rules), old slot is released, payment unchanged, `Booking.rescheduleCount` incremented; new confirmation email sent.
- [ ] Reschedule after window or when `maxReschedules` reached → blocked with clear message offering "Cancel and rebook" instead.
- [ ] All actions are auditable in admin (who/when/what/why if reason provided).

## Specs

- [ ] `specs/manage-booking-page.md` — UI flow, auth token mechanics
- [ ] `specs/refund-to-source-engine.md` — split-refund allocation algorithm, queue + retry, Stripe + pack credit transactional semantics
- [ ] `specs/reschedule-state-machine.md` — atomic slot swap, race handling

## Out of Scope (for this Story)

- Admin-initiated cancellation / reschedule on customer's behalf (covered by `admin-bookings-and-refunds.md`).
- Bulk operations.
- Rescheduling to a different service (V1+).
- Customer-initiated partial refunds (admin-only).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Refund mean time < 5 min for in-window cancellations (Stripe sandbox-verified, prod-monitored).
- [ ] Refund-to-source allocation property test: for any `(card_paid, pack_paid)` payment and any `total_to_refund`, the split is correct and conserves total.
- [ ] Manual refund intervention rate < 1% in pilot.
- [ ] All cancellation paths tested in both languages.
