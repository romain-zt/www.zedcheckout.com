# [TASK] Admin manages resources (practitioners) and availability

## Link
- **Spec:** `specs/admin-manage-resources.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T6.1 — Define `Resource`, `AvailabilityRule` entities in `packages/domain` (done in T1.2)
- [ ] T6.2 — Create resources + availability_rules Drizzle schema (done in T1.5)
- [ ] T6.3 — Implement `getAvailableWindows` in `packages/booking-engine` with property tests (M)
- [ ] T6.4 — PayloadCMS Resources + AvailabilityRules collections (M)
- [ ] T6.5 — Audit log integration for resource CRUD (S)

## Dependencies
- T6.1, T6.2 → already covered by T1.2 and T1.5
- T6.3 → depends on T6.1
- T6.4 → depends on T6.2
- T6.5 → depends on T6.4, T9.2

## Definition of Done

- [ ] All subtasks complete
- [ ] Property test: override always wins over recurring
- [ ] Disabled resource hidden from new bookings

## Notes
- `getAvailableWindows` is a prerequisite for `listAvailableSlots` (T1.3)
