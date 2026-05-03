# [TASK] Admin bookings view and manual refunds

## Link
- **Spec:** `specs/admin-bookings-and-refunds.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T9.1 — Define `AuditLog` entity in `packages/domain` (S)
- [ ] T9.2 — Create audit_logs Drizzle schema (S)
- [ ] T9.3 — PayloadCMS Bookings collection (list + detail views) (M)
- [ ] T9.4 — Status override actions with audit logging (M)
- [ ] T9.5 — Manual refund flow (full + partial) (M)
- [ ] T9.6 — Customer view with credit adjustment (M)

## Dependencies
- T9.1, T9.2 → no deps (start early for other tasks' audit needs)
- T9.3 → depends on T1.5, T9.2
- T9.4 → depends on T9.3, T8.3 (applyPolicy)
- T9.5 → depends on T9.4, T9c.3 (splitRefund), T9c.4 (createRefund)
- T9.6 → depends on T9.3, T2.5 (shopify credit wrappers)

## Definition of Done

- [ ] All subtasks complete
- [ ] Audit log entries for every override
- [ ] Manual refund uses splitRefund engine
- [ ] Required reason field enforced

## Notes
