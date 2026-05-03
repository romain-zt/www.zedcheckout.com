# [TASK] Book as guest, pay by card

## Link
- **Spec:** `specs/book-as-guest-card.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T1.1 — Define domain entities: `Booking`, `Payment`, `Customer`, `Slot` in `packages/domain` (S)
- [ ] T1.2 — Define domain entities: `Service`, `Resource`, `Room`, `Tenant` in `packages/domain` (S)
- [ ] T1.3 — Implement `listAvailableSlots` in `packages/booking-engine` with property tests (M)
- [ ] T1.4 — Implement `canBook` in `packages/booking-engine` with unit tests (S)
- [ ] T1.5 — Create Drizzle schema for all booking-related tables in `packages/database` (M)
- [ ] T1.6 — Implement `createPaymentIntent` + test double in `packages/payments` (S)
- [ ] T1.7 — Implement API routes: `GET /api/services`, `GET /api/slots` (S)
- [ ] T1.8 — Implement API routes: `POST /api/bookings`, webhook handler for confirm/fail (M)

## Dependencies
- T1.1 + T1.2 → no deps (start here)
- T1.3 → depends on T1.1, T1.2
- T1.4 → depends on T1.1, T1.2
- T1.5 → depends on T1.1, T1.2
- T1.6 → depends on T1.1
- T1.7 → depends on T1.3, T1.5
- T1.8 → depends on T1.4, T1.5, T1.6

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met (re-read spec before marking done)
- [ ] Linter clean (`0 errors`)
- [ ] Tests pass
- [ ] No hardcoded client values
- [ ] PR opened with spec link in description

## Notes

<!-- Anything discovered during implementation that the spec didn't cover -->
