# [SPEC] Cross-cutting Packages (Feature Flags + Observability)

## Meta
- **Status:** Implemented
- **Classification:** 1. Reusable Primitive
- **Target:** zedslot
- **Author:** Agent
- **Date:** 2026-05-03

## Problem

The V0 booking pilot cannot go live without two cross-cutting concerns:
1. **Feature flags** — checkout behavior (payment method order, pack redemption, checkout variant) must be toggleable per-tenant without redeploying. The architecture doc defines 7 typed flags. The email cron needs `notifications_email_reminder_hours`. CI needs a static fallback that doesn't call PostHog.
2. **Observability** — a payment-handling product shipping without error tracking is a liability. Structured logging with tenant/booking/trace context is required for debugging in a multi-tenant system. PII scrubbing is non-negotiable for a system handling customer emails and names.

Both packages are required by `apps/booking` (checkout flow, cron jobs) and `apps/admin` (future admin dashboards). Without them, errors in prod are invisible and feature rollouts require code changes.

## Solution

Two new wrapper packages following the existing pattern (interface + production client + test double):

### Track F: `packages/feature-flags` (`@zedslot/feature-flags`)

PostHog server-side evaluation wrapper with typed flag definitions.

### Track G: `packages/observability` (`@zedslot/observability`)

Sentry error tracking wrapper + structured JSON logger.

## Scope

### In Scope

**Track F — `packages/feature-flags`:**
- `src/flags.ts` — typed flag definitions with default values for all 7 flags
- `src/client.ts` — `FeatureFlagClient` interface with `evaluate<K>()` and `evaluateAll()`, `PostHogFeatureFlagClient` implementation, `createFeatureFlagClient()` factory
- `src/static.ts` — `StaticFeatureFlagClient` returning defaults or env-var overrides (for CI/offline)
- `src/__test-double/index.ts` — `InMemoryFeatureFlagClient` with settable flag values
- `src/index.ts` — barrel export
- `package.json` — `@zedslot/feature-flags`, dep: `posthog-node`
- Unit tests covering typed evaluation, default fallbacks, static client behavior

**Track G — `packages/observability`:**
- `src/sentry.ts` — `initSentry()` factory, `captureException()`, `captureMessage()`, PII scrubbing config
- `src/logger.ts` — structured JSON logger, `createLogger()` factory, `.with()` child logger, output JSON to stdout
- `src/__test-double/index.ts` — `InMemorySentryClient` + `InMemoryLogger`
- `src/index.ts` — barrel export
- `package.json` — `@zedslot/observability`, deps: `@sentry/node`, `@sentry/nextjs`
- Unit tests covering `.with()` context propagation, PII scrubbing, test double behavior

### Out of Scope
- Client-side (browser) flag evaluation — server-side only, client receives resolved values
- PostHog analytics events — separate package (`packages/analytics`, already exists)
- Sentry performance/tracing setup — error tracking only in V0
- Dashboard or UI for viewing logs/errors — use PostHog/Sentry SaaS dashboards
- Wiring into `apps/booking` or `apps/admin` — separate task after packages exist
- Source maps upload to Sentry — deployment concern (Phase 11)

## Technical Design

### Data Models

**Feature Flags — typed flag map:**

```ts
interface FlagDefinitions {
  checkout_variant: 'classic' | 'experimental';
  payment_method_order: 'apple_first' | 'card_first' | 'pack_first_if_available';
  pack_redemption_enabled: boolean;
  customer_account_auth_provider: 'magic_link_email' | 'shopify';
  language_default: 'fr' | 'en';
  experimental_room_only_renting: boolean;
  notifications_email_reminder_hours: number;
}

const FLAG_DEFAULTS: FlagDefinitions = {
  checkout_variant: 'classic',
  payment_method_order: 'card_first',
  pack_redemption_enabled: true,
  customer_account_auth_provider: 'magic_link_email',
  language_default: 'fr',
  experimental_room_only_renting: false,
  notifications_email_reminder_hours: 24,
};
```

**Logger — structured output format:**

```ts
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  // Baked-in context from .with()
  tenantId?: string;
  bookingId?: string;
  traceId?: string;
}
```

### API / Interfaces

**FeatureFlagClient:**

```ts
interface FeatureFlagClient {
  evaluate<K extends keyof FlagDefinitions>(
    flagName: K,
    context?: { tenantId?: string; userId?: string }
  ): Promise<FlagDefinitions[K]>;

  evaluateAll(
    context?: { tenantId?: string; userId?: string }
  ): Promise<FlagDefinitions>;
}

function createFeatureFlagClient(apiKey: string, options?: { host?: string }): FeatureFlagClient;
```

**SentryClient:**

```ts
interface SentryClient {
  captureException(error: Error, context?: Record<string, unknown>): string;
  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: Record<string, unknown>): string;
}

function initSentry(dsn: string, options?: { environment?: string; release?: string }): SentryClient;
```

**Logger:**

```ts
interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  with(context: { tenantId?: string; bookingId?: string; traceId?: string }): Logger;
}

function createLogger(options?: { name?: string; level?: 'info' | 'warn' | 'error' }): Logger;
```

### Dependencies

| Package | External dep | Stays inside |
|---------|-------------|-------------|
| `@zedslot/feature-flags` | `posthog-node` | This package only |
| `@zedslot/observability` | `@sentry/node`, `@sentry/nextjs` | This package only |

No cross-dependency between Track F and Track G.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| PostHog is unreachable during flag evaluation | Return default value from `FLAG_DEFAULTS`, never throw |
| Unknown flag name passed to `evaluate()` | TypeScript compile error (generic constraint) — impossible at runtime if types are respected |
| `StaticFeatureFlagClient` with env var override `FF_PACK_REDEMPTION_ENABLED=false` | Parses string to boolean, returns `false` instead of default `true` |
| `StaticFeatureFlagClient` with env var for numeric flag `FF_NOTIFICATIONS_EMAIL_REMINDER_HOURS=48` | Parses string to number, returns `48` |
| Sentry DSN is empty/invalid at init | `initSentry` returns a no-op client that logs to console instead of throwing |
| `captureException` called with an error containing customer email in message | PII scrubbing strips emails from breadcrumbs/context before sending to Sentry |
| `logger.with({ tenantId: 'x' }).with({ bookingId: 'y' })` | Child logger inherits both `tenantId` and `bookingId` in every log line |
| `logger.error()` with `data` containing `customerEmail` field | PII scrubbing replaces value with `[REDACTED]` in log output |
| Multiple `evaluateAll` calls in rapid succession | Each call is independent — no caching in V0 (PostHog SDK handles its own caching) |

## Definition of Done

- [ ] `packages/feature-flags/` exists with `package.json` (`@zedslot/feature-flags`)
- [ ] All 7 typed flags defined with correct types and defaults
- [ ] `FeatureFlagClient` interface + `PostHogFeatureFlagClient` implementation pass type checks
- [ ] `StaticFeatureFlagClient` returns defaults and correctly parses env-var overrides (string → boolean/number)
- [ ] `InMemoryFeatureFlagClient` allows setting flag values in tests
- [ ] `posthog-node` import exists only inside `packages/feature-flags`
- [ ] `packages/observability/` exists with `package.json` (`@zedslot/observability`)
- [ ] `initSentry()` returns a functional client; returns no-op client when DSN is invalid
- [ ] PII fields (`email`, `phone`, `customerName`) are scrubbed from Sentry context/breadcrumbs
- [ ] `createLogger()` returns a logger that outputs JSON to stdout
- [ ] `logger.with()` returns a child logger that includes context fields in every log line
- [ ] `InMemorySentryClient` records captured exceptions for test assertions
- [ ] `InMemoryLogger` records log entries for test assertions
- [ ] `@sentry/node` and `@sentry/nextjs` imports exist only inside `packages/observability`
- [ ] All tests pass (`pnpm --filter @zedslot/feature-flags test` + `pnpm --filter @zedslot/observability test`)
- [ ] No `any` types in public API surfaces

## Open Questions

- [x] Should feature flags be evaluated per-request or cached? — Per-request; PostHog SDK handles its own local evaluation cache.
- [x] Should Sentry also handle performance tracing in V0? — No, error tracking only. Perf tracing deferred.
