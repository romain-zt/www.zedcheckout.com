# Implementation Order — zedslot V0

## Phase 1: Domain + Engine (pure TS, zero deps) — DONE

```
├── T1.1 + T1.2: Domain entities (Booking, Payment, Customer, Service, Resource, Room, Tenant, Slot)
├── T8.1: Policy entity + CancellationOutcome types
├── T2.1: PackHold + SplitPaymentBreakdown
├── T4.1: ScheduledEmail entity
├── T9c.1: Refund + RefundAllocation
├── T9.1: AuditLog entity
│
├── T6.3: getAvailableWindows (availability composition)
├── T1.3: listAvailableSlots (depends on getAvailableWindows)
├── T1.4: canBook (conflict pre-check)
├── T7.3: assignRoom
├── T8.3: applyPolicy, canReschedule, formatPolicyText
├── T2.2: calculateSplitPayment
├── T9c.3: splitRefund
├── T4.5: generateICS, calendar URLs
```

All entities + engine functions implemented. Tests in `packages/booking-engine/tests/`.

## Phase 2: Database (Drizzle schema + DrizzleBookingStore) — DONE

```
├── T1.5: All tables (tenants, services, resources, rooms, availability_rules, bookings,
│         payments, customers, service_resources, service_rooms)
├── T2.3: pack_holds table
├── T4.2: scheduled_emails table
├── T9c.2: refunds table
├── T9.2: audit_logs table
├── T8.2: policies table
├── T3.1 + T3.2 + T3.3: btree_gist + EXCLUDE constraints (in schema, not yet migrated)
│
├── DrizzleBookingStore: Full store implementation (~880 lines)
├── client.ts: createDatabase factory
```

Schema definitions in `packages/database/src/schema/`. Real DB store replaces InMemoryBookingStore when `DATABASE_URL` is set (`apps/booking/src/lib/bootstrap.ts`).

## Phase 3: Wrapper Packages (external SDKs behind interfaces) — DONE

```
├── T1.6: packages/payments — PaymentsClient interface + InMemoryPaymentsClient
├── T9c.4: packages/payments — createRefund included in interface
├── T4.3: packages/email — EmailSender interface + ResendSender + React Email templates
├── T2.4: packages/auth — AuthClient interface + InMemoryAuthClient
├── T2.5: packages/shopify — ShopifyClient interface + InMemoryShopifyClient
```

All wrappers have: interface, test double, barrel export. Email also has production Resend implementation + 3 React Email templates.

## Phase 4: API + Integration — DONE

```
├── T1.7: GET /api/services, GET /api/slots, GET /api/resources
├── T1.8: POST /api/bookings, webhook handler (Stripe)
├── T3.4 + T3.5: BookingConflictError wiring
├── T8.5: Policy snapshot on booking creation
├── T2.6: Split payment orchestration
├── T4.6 + T4.7: Email scheduling + cron (process-emails, expire-pending)
├── T3.6 + T2.7: Pending expiry + pack hold expiry jobs
├── T9c.5: Cancel/reschedule API routes
├── T9c.6: Cancellation email wiring
├── Auth routes: magic-link send + verify
├── Customer balance endpoint
```

14 route handlers in `apps/booking/src/app/api/`. Handler logic in `src/lib/handlers/`.

## Phase 5: Booking UI — IN PROGRESS (Tracks A + B)

```
├── Track A: Core checkout flow (service → slot → pay → confirm)
│   ├── BookingFlow.tsx — orchestrator
│   ├── ServicePicker, PractitionerPicker, SlotPicker
│   ├── CustomerForm, PackCreditSection
│   ├── PaymentSection (Stripe Elements)
│   ├── ConfirmationScreen, BookingStatusPoller
│
├── Track B: Manage booking page (cancel/reschedule)
│   ├── app/manage/[bookingId]/page.tsx
│   ├── booking-summary.tsx, status-display.tsx
│   ├── cancel-section.tsx, reschedule-section.tsx
```

## Phase 6: Shared Packages — IN PROGRESS (Track C)

```
├── packages/ui — 12 components (button, input, card, dialog, tabs, badge, status-badge,
│                  spinner, skeleton, radio-group, scroll-area) + design tokens
├── packages/analytics — PostHogAnalyticsClient + typed events + test double
```

## Phase 7: Admin (PayloadCMS) — IN PROGRESS (Track E)

```
├── payload.config.ts — Drizzle postgres adapter, registers existing schema
├── Collections: Users, Services, Resources, Rooms, AvailabilityRules,
│                Policies, Bookings, Customers, AuditLogs
├── Hooks: tenant-scoping.ts
├── Next.js app shell for admin routes
```

## Phase 8: Email Templates — IN PROGRESS (Track D)

```
├── booking-confirmation.tsx (FR + EN)
├── booking-reminder.tsx
├── booking-cancellation.tsx
├── email-layout.tsx + copy.ts
```

---

## Final Milestone: What Remains

### Phase 9: Cross-cutting Packages — DONE (Tracks F + G)

```
├── Track F: packages/feature-flags
│   ├── Typed flag definitions (7 flags from architecture doc)
│   ├── FeatureFlagClient interface + PostHogFeatureFlagClient
│   ├── StaticFeatureFlagClient (CI/offline fallback)
│   ├── InMemoryFeatureFlagClient (test double)
│   ├── 13 tests passing
│
├── Track G: packages/observability
│   ├── Sentry wrapper (initSentry, captureException, PII scrubbing)
│   ├── Structured JSON logger (createLogger, logger.with() child loggers)
│   ├── InMemorySentryClient + InMemoryLogger (test doubles)
│   ├── 18 tests passing
```

> **Spec:** `specs/cross-cutting-packages.md` (Implemented)

### Phase 10: Migrations + Seed — DONE (Track H)

```
├── db:migrate + db:migrate:create scripts in apps/admin/package.json
├── tooling/exclude-constraints.sql — EXCLUDE constraint SQL ready for custom migration
├── tooling/seed.ts — Little Biceps V0 data via Payload Local API (idempotent)
│   ├── Tenant, admin user, 4 resources, 2 rooms, 3 services
│   ├── Availability rules, global policy
├── db:seed script in root package.json
```

> **Spec:** `specs/migrations-and-seed.md` (Implemented)

### Phase 11: Deployment + CI — DONE

```
├── turbo.json — extended with SENTRY_DSN + PAYLOAD_SECRET env passthrough
├── .github/workflows/ci.yml — CI pipeline (typecheck, lint, test on PR + push to main)
├── apps/admin/vercel.json — payload migrate in build command
├── docs/env-vars.md — comprehensive env var documentation
```

> **Spec:** `specs/deployment-and-ci.md` (Implemented)

### Phase 12: E2E Tests — DEFERRED (nice-to-have, not blocking V0)

```
├── Playwright setup + config
├── Guest booking happy path
├── Pack credit redemption path
├── Cancel/reschedule path
```

Qualitative unit + integration tests are sufficient for V0 pilot. E2E deferred to post-pilot.

> **Spec:** `specs/e2e-tests.md`

### Phase 13: Go-live — TODO

```
├── DNS: book.littlebiceps.com CNAME → Vercel
├── DNS: admin.zedslot.com CNAME → Vercel
├── Run migrations on Neon prod
├── Run seed on prod
├── Smoke test on production
```

> **Spec:** `specs/go-live-checklist.md`

---

## Parallel Opportunities

### Currently running (5 tracks: A, B, C, D, E)

All independent — zero cross-dependencies.

### Ready to start now (2 tracks: F + G)

| Track | What | Dependencies |
|-------|------|-------------|
| F | packages/feature-flags | None — standalone wrapper package |
| G | packages/observability | None — standalone wrapper package |

F and G are fully independent of each other AND of all running tracks. Maximum parallelism: **7 concurrent tracks** (A + B + C + D + E + F + G).

### Blocked

| Track | What | Blocked by |
|-------|------|-----------|
| H | Migrations + seed | Track E (PayloadCMS must land first) |

### Sequential after all tracks

Phase 11 (deployment) → Phase 13 (go-live). Phase 12 (E2E) deferred to post-pilot.

**Exception:** CI workflows (part of Phase 11) can start as soon as Turborepo pipeline is extended.

---

## Track Summary

| Track | Phase | What | Status |
|-------|-------|------|--------|
| — | 1 | Domain + Engine | DONE |
| — | 2 | Database schema + DrizzleBookingStore | DONE |
| — | 3 | Wrapper packages | DONE |
| — | 4 | API + Integration | DONE |
| A | 5 | Core checkout UI | IN PROGRESS |
| B | 5 | Manage booking page | IN PROGRESS |
| C | 6 | packages/ui + analytics | IN PROGRESS |
| D | 8 | Email templates | IN PROGRESS |
| E | 7 | PayloadCMS admin | IN PROGRESS |
| F | 9 | packages/feature-flags | DONE |
| G | 9 | packages/observability | DONE |
| H | 10 | Migrations + seed | DONE |
| — | 11 | Deployment + CI | DONE |
| — | 12 | E2E tests | DEFERRED (post-pilot) |
| — | 13 | Go-live | TODO — manual steps |
