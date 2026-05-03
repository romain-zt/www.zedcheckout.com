# [TASK] Admin manages rooms

## Link
- **Spec:** `specs/admin-manage-rooms.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T7.1 — Define `Room` entity in `packages/domain` (done in T1.2)
- [ ] T7.2 — Create rooms Drizzle schema (done in T1.5)
- [ ] T7.3 — Implement `assignRoom` in `packages/booking-engine` with unit tests (S)
- [ ] T7.4 — PayloadCMS Rooms collection (S)
- [ ] T7.5 — Room-only booking flow variant (S)

## Dependencies
- T7.1, T7.2 → already covered by T1.2 and T1.5
- T7.3 → depends on T7.1
- T7.4 → depends on T7.2
- T7.5 → depends on T7.3, T1.8

## Definition of Done

- [ ] All subtasks complete
- [ ] EXCLUDE constraint covers room overlap
- [ ] Room-only service bookable

## Notes
