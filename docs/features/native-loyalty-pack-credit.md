# [FEATURE] Native loyalty + pack + discount + in-store credit (V0.1)

> **Status:** Stub — full PRD will be drafted at the end of V0 once the booking pilot validates the wedge.

## Meta
- **Status:** Proposed
- **Classification:** **2. Project Primitive** (initially built for Little Biceps; extracted to Reusable Primitive in V1).
- **Vision link:** `docs/vision.md` — directly addresses the "Froonze + Pack + Discount + In-Store Credit on Shopify is a hell" pain explicitly flagged.
- **Owner:** Romain Piveteau
- **Created:** 2026-05-03

## Problem

On Shopify, the combination of **Froonze loyalty + Pack credit + Discount engine + In-Store Credit** is fragmented across multiple apps that don't share a coherent data model. Practical pain at Little Biceps and similar wellness shops:

- Customers can't see their actual usable balance in one place.
- Discounts don't compose well with pack credit and gift cards (rules conflict, sometimes silently).
- Refund-to-credit flows are manual.
- Loyalty point earning rules are constrained by Froonze's model.
- Reporting is split across N apps.

V0 of zedslot redeems pack credit *against Shopify as the source of truth*. V0.1 makes **zedslot the source of truth** for credit, with Shopify as a downstream sink (or detached entirely for credit-tracking).

## Outcome (sketch)

A single native module that handles:

- **Packs** — €X paid → €Y credited, configurable bonus tiers, per-pack expiry rules.
- **Gift cards** — native, with QR code + email delivery; scannable in admin for in-shop usage.
- **Discount engine** — % off, fixed off, code-based, eligibility rules (service, customer segment, time window, minimum spend); composable with credit and gift cards under deterministic rules.
- **Loyalty points** — earn rules (per-€-spent, per-booking, per-anniversary, per-referral); redeem as credit at checkout.
- **All four redeemable in the booking checkout** via the existing split-source payment orchestration.
- **Migration tool** — one-shot import of existing Froonze + pack + gift-card data into the native model.
- **Replaces** Froonze read calls in `packages/shopify` with native reads from `packages/database`.

## Smallest valuable slice (provisional)

> **As an admin, I can create a Pack product (€550 paid → €600 credit) in zedslot, and existing customers' Froonze pack balances are automatically migrated and usable at booking checkout without any manual step.**

## Stories (provisional, will be refined at PRD time)

- Pack model + admin CRUD + booking-checkout redemption against native source.
- Gift card model + admin CRUD + email delivery + booking-checkout redemption.
- Discount engine + admin CRUD + composability rules.
- Loyalty points engine + earn rules + redeem flow.
- Froonze migration tool (one-shot importer + dry-run + diff report).
- Reporting dashboard (admin sees credit balance liability, points outstanding, discount usage).

## Out of Scope (V0.1)

- POS integration (in-store payment with credit by QR scan in physical institute) — V1+.
- Multi-tenant credit pools / shared loyalty across merchants — never.
- Subscription / recurring billing for customers — separate Feature.

## Dependencies

- V0 must be live and stable.
- Existing Froonze data export accessible (CSV or API).
- Customers educated on the cutover (admin-controlled comms templates).

## Risks (high-level)

- **Migration data loss** — any €1 of customer credit lost is a brand-trust event.
- **Composability rules are subtle** — discount + pack + gift card + loyalty redeemed together can produce surprising final prices; needs clear rule precedence + UI surfacing the breakdown.
- **Cutover timing** — must happen during a low-traffic window, with rollback path to Froonze for ≥ 30 days.

## Kill Criteria

If V0 doesn't validate the wedge → V0.1 is moot, kill this Feature too.

If migration dry-run shows > 0.1% credit drift between Froonze and native → block cutover until reconciled.
