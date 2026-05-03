# [TASK] Payload Migrations + Little Biceps Seed

## Link
- **Spec:** `specs/migrations-and-seed.md`
- **Branch:** `cursor/final-milestone-eb58`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] Add db:migrate and db:migrate:create scripts to `apps/admin/package.json`
- [ ] Create `tooling/seed.ts` with Little Biceps V0 data using Payload Local API
- [ ] Seed includes: tenant, admin user, 4 resources, 2 rooms, 3 services, availability rules, policy
- [ ] Seed is idempotent (check-before-insert with fixed UUIDs)
- [ ] Add `db:seed` script to root `package.json`
- [ ] Document EXCLUDE constraint migration SQL for custom migration step

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met
- [ ] Seed script compiles with `tsc --noEmit`
- [ ] All entity UUIDs are fixed and deterministic
- [ ] Seed uses Payload Local API, not raw Drizzle

## Notes
<!-- Actual `payload migrate:create` requires a running DB; the seed script is created ready-to-run -->
