# [STORY] Checkout A/B test flag

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P1
- **Created:** 2026-05-03

## User Statement

> As a product owner, I can A/B-test checkout variants behind a feature flag (PostHog-backed) and read a real-time funnel showing which variant converts better — so I can validate the +48% wedge in production and iterate safely.

## Acceptance Criteria

- [ ] `packages/feature-flags` exposes a typed `checkout_variant: 'classic' | 'experimental'` flag (extensible to N variants).
- [ ] PostHog evaluates the flag deterministically per visitor (sticky assignment via PostHog distinct ID stored in cookie).
- [ ] Flag value is server-side resolved at request time and passed down to the booking app via Next.js layout — client never sees the raw flag definition.
- [ ] During the pilot launch window, flag is configured for **50/50 traffic split** between `classic` (= the existing hand-rolled hack pattern preserved as Variant A) and `experimental` (= the new hosted checkout). After validation period, flag flips to 100% experimental.
- [ ] PostHog funnel dashboard (`zedslot — booking conversion`) tracks conversion by variant: `slot_viewed → slot_selected → checkout_loaded → payment_submitted → payment_succeeded`.
- [ ] Statistical confidence indicator: dashboard shows when results are significant (PostHog has built-in support for this).
- [ ] Kill switch: flag can be flipped to 100% `classic` (= rollback) within 60s of decision, no redeploy required.
- [ ] All flag inventory documented in `packages/feature-flags/README.md`: name, type, purpose, owner, default value, rollout strategy.

## Specs

- [ ] `specs/feature-flags-package.md` — typed flag definitions, server-side evaluation, fallback config
- [ ] `specs/posthog-funnel-events.md` — typed event builders, payload shape, naming conventions
- [ ] `specs/checkout-variant-routing.md` — how variant is resolved at request time, sticky assignment, override mechanism for QA

## Out of Scope (for this Story)

- Multi-variate testing (more than 2 variants) — V1.
- Bayesian / sequential testing — V1.
- Auto-promotion of winning variant — V1.
- Per-tenant flag overrides UI — V1.

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] PostHog funnel verified on staging with synthetic traffic (50/50 split observed within statistical noise).
- [ ] Kill-switch tested end-to-end: flip → all production traffic on `classic` within 60s.
- [ ] Documentation: how to add a new flag, how to read the funnel dashboard.
