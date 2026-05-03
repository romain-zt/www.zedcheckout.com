# [SPEC] Deployment + CI Configuration

## Meta
- **Status:** Implemented
- **Classification:** 1. Reusable Primitive
- **Target:** zedslot
- **Author:** Agent
- **Date:** 2026-05-03

## Problem

The monorepo has no CI pipeline and incomplete deployment configuration:
- No GitHub Actions workflows — PRs merge without type checking, tests, or lint
- `turbo.json` exists but has only basic task definitions — no caching config, no env passthrough, no app-specific outputs
- `apps/booking` has a `vercel.json` but `apps/admin` does not
- No Neon database provisioning documentation
- Environment variables (Stripe, Resend, PostHog, Sentry, DATABASE_URL) are not documented or validated

A payment-handling product cannot ship without CI and reproducible deployments.

## Solution

Extend Turborepo config, add GitHub Actions CI workflow, configure Vercel for both apps, and document environment variable requirements.

## Scope

### In Scope
- `turbo.json` — extend with env passthrough (`NEXT_PUBLIC_*`, `DATABASE_URL`, etc.), caching rules, app-specific build outputs
- `.github/workflows/ci.yml` — typecheck + test + lint on every PR, using Turborepo for task orchestration
- `apps/admin/vercel.json` — build command with `payload migrate` step
- `docs/env-vars.md` — document all required environment variables with descriptions and which app/package consumes them
- Validate env vars at build time (fail fast if missing)

### Out of Scope
- Neon database provisioning (manual/infra step, documented but not automated)
- Vercel project creation (manual via dashboard)
- Staging/preview environments — V0 is prod-only
- Remote Turborepo cache setup (nice-to-have, not blocking)
- Source map upload to Sentry (future)
- CD pipeline (auto-deploy on merge) — Vercel handles this natively

## Technical Design

### Turborepo Config (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "env": [
        "DATABASE_URL",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_POSTHOG_KEY",
        "NEXT_PUBLIC_POSTHOG_HOST"
      ]
    },
    "test": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo typecheck
      - run: pnpm turbo lint
      - run: pnpm turbo test
```

### Vercel Config (`apps/admin/vercel.json`)

```json
{
  "buildCommand": "pnpm payload migrate && pnpm run build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs"
}
```

### Environment Variables Documentation

`docs/env-vars.md` listing every var, which package reads it, and whether it's required/optional.

### API / Interfaces

No new application code. Config files only.

### Dependencies

| Dependency | Notes |
|-----------|-------|
| GitHub Actions runners | Standard ubuntu-latest |
| `pnpm/action-setup@v4` | pnpm installer for CI |
| `actions/setup-node@v4` | Node.js setup with pnpm cache |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| PR adds a new package without updating `turbo.json` | Turborepo auto-discovers workspaces — no config needed per package |
| CI runs without `DATABASE_URL` | Tests using `StaticFeatureFlagClient` and `InMemory*` test doubles pass; DB-dependent tests are skipped or mocked |
| `pnpm install --frozen-lockfile` fails due to lockfile mismatch | CI job fails fast with clear error message |
| Vercel build for `apps/admin` without `DATABASE_URL` | Build fails at `payload migrate` step — required env var must be set in Vercel project settings |
| Two PRs merge concurrently, both modifying `turbo.json` | Standard git merge conflict — manual resolution |

## Definition of Done

- [ ] `turbo.json` includes env passthrough for all required variables
- [ ] `.github/workflows/ci.yml` exists and runs typecheck, lint, test on PRs
- [ ] CI workflow uses Turborepo for task orchestration
- [ ] `apps/admin/vercel.json` exists with `payload migrate` in build command
- [ ] `docs/env-vars.md` documents all required environment variables
- [ ] CI passes on a clean PR with no application changes (smoke test the workflow itself)

## Open Questions

- [x] Use Turborepo remote cache? — Deferred, not needed for V0 with a small team.
- [x] Separate CI jobs per app or single job? — Single job with Turborepo task graph handles parallelism.
