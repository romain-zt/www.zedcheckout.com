# [TASK] Cross-cutting Packages (Feature Flags + Observability)

## Link
- **Spec:** `specs/cross-cutting-packages.md`
- **Branch:** `cursor/final-milestone-eb58`

## Scope Classification
1. Reusable Primitive

## Subtasks

### Track F — packages/feature-flags
- [ ] Create `packages/feature-flags/package.json` with `@zedslot/feature-flags`, dep: `posthog-node`
- [ ] Create `packages/feature-flags/tsconfig.json` matching existing package convention
- [ ] Create `src/flags.ts` — typed FlagDefinitions interface + FLAG_DEFAULTS for all 7 flags
- [ ] Create `src/client.ts` — FeatureFlagClient interface + PostHogFeatureFlagClient + createFeatureFlagClient factory
- [ ] Create `src/static.ts` — StaticFeatureFlagClient with env-var override parsing
- [ ] Create `src/__test-double/index.ts` — InMemoryFeatureFlagClient
- [ ] Create `src/index.ts` — barrel export
- [ ] Write unit tests covering typed evaluation, default fallbacks, static client, env-var parsing

### Track G — packages/observability
- [ ] Create `packages/observability/package.json` with `@zedslot/observability`, deps: `@sentry/node`
- [ ] Create `packages/observability/tsconfig.json`
- [ ] Create `src/sentry.ts` — SentryClient interface + initSentry + captureException + PII scrubbing
- [ ] Create `src/logger.ts` — Logger interface + createLogger + .with() child logger + JSON stdout + PII scrubbing
- [ ] Create `src/__test-double/index.ts` — InMemorySentryClient + InMemoryLogger
- [ ] Create `src/index.ts` — barrel export
- [ ] Write unit tests covering .with() context, PII scrubbing, test doubles

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met (re-read spec before marking done)
- [ ] Linter clean (`0 errors`)
- [ ] Tests pass
- [ ] No hardcoded client values
- [ ] No `any` types in public API surfaces

## Notes
