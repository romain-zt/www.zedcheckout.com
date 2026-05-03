# [TASK] No double-booking guarantee

## Link
- **Spec:** `specs/no-double-booking-guarantee.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T3.1 — Create migration enabling `btree_gist` extension (S)
- [ ] T3.2 — Create migration adding `no_room_overlap` EXCLUDE constraint (S)
- [ ] T3.3 — Create migration adding `no_resource_overlap` EXCLUDE constraint (S)
- [ ] T3.4 — Implement `BookingConflictError` in `packages/database` (S)
- [ ] T3.5 — Wire DB constraint violation catch → typed error in booking insert/update (S)
- [ ] T3.6 — Implement pending booking expiry cron job (S)
- [ ] T3.7 — Property test: concurrent bookings → no overlaps (M)

## Dependencies
- T3.1, T3.2, T3.3 → depend on T1.5 (bookings table schema)
- T3.4, T3.5 → depend on T3.2, T3.3
- T3.6 → depends on T1.5
- T3.7 → depends on T3.5, T1.4 (canBook)

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met
- [ ] EXCLUDE constraints in migration SQL
- [ ] BookingConflictError typed and caught
- [ ] Property test: no two confirmed bookings overlap
- [ ] Expiry job tested

## Notes
