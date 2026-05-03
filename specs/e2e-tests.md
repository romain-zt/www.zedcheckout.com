# [SPEC] E2E Tests (Playwright)

## Meta
- **Status:** In Review
- **Classification:** 5. Future Option
- **Target:** zedslot
- **Author:** Agent
- **Date:** 2026-05-03

## Problem

The architecture doc mentions E2E tests. However, with qualitative unit tests + integration tests covering the booking engine, API handlers, and store layer, E2E tests are a nice-to-have rather than a blocker for V0 pilot launch. The booking flow involves multi-step UI interactions (service selection → slot picking → payment → confirmation) that E2E tests could cover as an additional safety net.

## Solution

Set up Playwright for `apps/booking` with 3 critical path test suites covering the guest booking happy path, pack credit redemption, and cancel/reschedule.

## Scope

### In Scope
- Playwright setup and config for `apps/booking`
- Test suite 1: Guest booking happy path (service → slot → customer info → card payment → confirmation)
- Test suite 2: Pack credit redemption (service → slot → apply pack → pay remainder → confirmation)
- Test suite 3: Cancel and reschedule (load manage page → cancel booking → verify status; load manage page → reschedule → verify new slot)
- Test fixtures: mock Stripe (test mode), seeded database, test tenant
- CI integration: Playwright runs in the GitHub Actions CI workflow

### Out of Scope
- E2E tests for `apps/admin` — PayloadCMS has its own testing patterns
- Visual regression testing (screenshot comparison)
- Performance/load testing
- Cross-browser testing beyond Chromium in V0
- Mobile device testing in CI (responsive is tested via viewport sizing)

## Technical Design

### Playwright Config

```ts
// apps/booking/playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: true,
  },
  use: {
    viewport: { width: 375, height: 812 }, // mobile-first
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
```

### Test Suites

**Suite 1 — Guest booking happy path:**
1. Navigate to booking page
2. Select a service
3. Select a practitioner
4. Pick an available slot
5. Fill customer form (name, email)
6. Enter card details (Stripe test card `4242...`)
7. Submit payment
8. Verify confirmation screen renders with booking ID

**Suite 2 — Pack credit redemption:**
1. Navigate to booking page with a seeded customer who has pack credit
2. Select service, practitioner, slot
3. Apply pack credit (verify amount deducted from total)
4. Pay remaining balance with card
5. Verify confirmation shows split payment breakdown

**Suite 3 — Cancel / reschedule:**
1. Create a booking (or use seeded confirmed booking)
2. Navigate to manage page `/manage/[bookingId]`
3. Cancel the booking → verify status changes to `cancelled`
4. Create another booking
5. Reschedule to a different slot → verify new time displayed

### Test Fixtures

- Seeded test tenant + services + resources + rooms + availability
- Stripe test mode (no real charges)
- Test customer with known pack credit balance

### API / Interfaces

No new application APIs. Tests interact with the existing UI.

### Dependencies

| Dependency | Notes |
|-----------|-------|
| `@playwright/test` | E2E testing framework |
| Stripe test mode | Test card numbers, test webhooks |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Slot becomes unavailable between selection and payment | Booking attempt fails with conflict error, user sees retry prompt |
| Stripe webhook is delayed during E2E test | `BookingStatusPoller` retries; test waits for confirmation with timeout |
| Pack credit exceeds service price (full pack payment) | No card payment required, booking confirms via pack only |
| Cancel button on a booking within free cancellation window | Full refund initiated, status changes to `cancelled` |
| Reschedule when no alternative slots are available | Reschedule UI shows "no available slots" message |

## Definition of Done

- [ ] `apps/booking/playwright.config.ts` exists with mobile-first viewport
- [ ] `apps/booking/e2e/` directory contains 3 test files
- [ ] Guest booking happy path test passes end-to-end
- [ ] Pack credit redemption test passes with seeded customer balance
- [ ] Cancel and reschedule test passes for confirmed bookings
- [ ] Tests run in CI via `.github/workflows/ci.yml` (or a separate e2e workflow)
- [ ] Tests use Stripe test mode — no real charges
- [ ] All tests run on mobile (375px) and desktop (1440px) viewports

## Open Questions

- [x] Should E2E tests run on every PR or only on `main` pushes? — **Not blocking V0. Deferred to post-pilot.** Qualitative unit + integration tests are sufficient.
- [x] Use Stripe test mode or mock Stripe entirely? — Stripe test mode for realistic integration testing.
