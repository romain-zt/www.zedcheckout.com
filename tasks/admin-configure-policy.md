# [TASK] Admin configures policy

## Link
- **Spec:** `specs/admin-configure-policy.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T8.1 — Define `Policy`, `CancellationOutcome` in `packages/domain` (S)
- [ ] T8.2 — Create policies Drizzle schema + default seed (S)
- [ ] T8.3 — Implement `applyPolicy`, `canReschedule`, `formatPolicyText` in `packages/booking-engine` (M)
- [ ] T8.4 — PayloadCMS Policies collection with edit-creates-new-row hook (M)
- [ ] T8.5 — Wire `Booking.policyId` on booking creation (S)

## Dependencies
- T8.1 → no deps
- T8.2 → depends on T8.1
- T8.3 → depends on T8.1
- T8.4 → depends on T8.2
- T8.5 → depends on T8.2, T1.8

## Definition of Done

- [ ] All subtasks complete
- [ ] Default policy seeded
- [ ] Policy snapshot on booking creation
- [ ] Property test: policy change doesn't affect existing bookings
- [ ] Policy text in FR + EN

## Notes
