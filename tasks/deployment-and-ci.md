# [TASK] Deployment + CI Configuration

## Link
- **Spec:** `specs/deployment-and-ci.md`
- **Branch:** `cursor/final-milestone-eb58`

## Scope Classification
1. Reusable Primitive

## Subtasks

- [ ] Update `turbo.json` with env passthrough for all required variables
- [ ] Create `.github/workflows/ci.yml` — typecheck + lint + test on PRs using Turborepo
- [ ] Create `apps/admin/vercel.json` with payload migrate in build command
- [ ] Create `docs/env-vars.md` documenting all environment variables
- [ ] Verify CI config is syntactically valid

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met
- [ ] `.github/workflows/ci.yml` exists and runs typecheck, lint, test on PRs
- [ ] CI workflow uses Turborepo for task orchestration
- [ ] `apps/admin/vercel.json` exists with `payload migrate` in build command
- [ ] `docs/env-vars.md` documents all required environment variables

## Notes
