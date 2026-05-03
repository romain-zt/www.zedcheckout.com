# [STORY] Redeem pack / gift-card credit at booking checkout

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As a returning customer with prepaid pack credit (or a gift card balance), I can authenticate via a one-tap email magic link to redeem my credit at booking — fully or split with card — without leaving the checkout flow.

## Acceptance Criteria

- [ ] On the checkout screen, a "Use my pack credit" or "Use a gift card" affordance is visible (small, secondary — does not block guest card flow).
- [ ] Tapping it opens an email-input → magic-link flow that completes in < 30s for a returning user (link click → back in checkout, balance shown).
- [ ] After auth, the customer sees their available pack credit + gift card balance + the booking total.
- [ ] If credit ≥ total → "Pay with credit" is the primary button; no card details required.
- [ ] If credit < total → split payment UI shows "€X from credit + €Y by card" with the card form rendered for the remainder.
- [ ] Confirming a credit-only payment debits the credit and confirms the booking; no Stripe charge is attempted.
- [ ] Confirming a split payment runs the two-phase orchestration (reserve credit → charge card → debit credit on success / release on failure) with no inconsistent intermediate state visible to the user.
- [ ] If pack-credit reservation fails or expires (15-min hold), the user sees a friendly error and can retry without re-authenticating.
- [ ] If `pack_redemption_enabled` flag is off (Shopify outage), the credit affordance is hidden and the customer sees "Pack redemption temporarily unavailable" if they try to access it via direct link.
- [ ] Magic-link emails are delivered within 30s in 99% of cases (Resend metric).

## Specs

- [ ] `specs/customer-magic-link-auth.md` — magic-link issuance, validation, session cookie scope
- [ ] `specs/credit-balance-lookup.md` — Shopify Customer Account API + metafield read flow, caching policy
- [ ] `specs/split-source-payment-orchestration.md` — two-phase reserve/confirm/release state machine, idempotency, hold expiry
- [ ] `specs/pack-redemption-feature-flag.md` — kill-switch behavior, UI degradation, monitoring

## Out of Scope (for this Story)

- Native loyalty / pack management (V0.1 — separate Feature).
- Manual credit adjustment by admin (covered by `admin-bookings-and-refunds.md`).
- POS / in-store credit usage.

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Tested at 320px mobile.
- [ ] Pack-redemption attempt rate ≥ 60% on returning customers with positive balance (post-launch metric — measured weekly).
- [ ] Pack-redemption success rate ≥ 99%.
- [ ] Idempotency verified: replaying the same payment-confirm request never double-debits credit.
- [ ] Failure-injection test: forced Shopify API outage → kill-switch flips, UI degrades gracefully, no orphaned holds.
