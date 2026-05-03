# [TASK] Admin manages services

## Link
- **Spec:** `specs/admin-manage-services.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T5.1 — Define `Service` entity in `packages/domain` (done in T1.2)
- [ ] T5.2 — Create services + junction tables Drizzle schema (done in T1.5)
- [ ] T5.3 — PayloadCMS Services collection with i18n, eligibility, validation hooks (M)
- [ ] T5.4 — Soft-delete protection hook (block delete if confirmed bookings) (S)
- [ ] T5.5 — Audit log integration for service CRUD (S)

## Dependencies
- T5.1, T5.2 → already covered by T1.2 and T1.5
- T5.3 → depends on T5.2
- T5.4 → depends on T5.3
- T5.5 → depends on T5.3, T9.2 (audit_logs table)

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met
- [ ] Validation: requiresResource → non-empty eligibleResources
- [ ] Disabled service hidden from booking subdomain
- [ ] Audit log on create/edit/disable

## Notes
- T5.1 and T5.2 are shared with book-as-guest-card task; no duplication
