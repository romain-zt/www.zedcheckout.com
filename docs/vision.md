# [VISION] ZedCheckout / zedslot

> One vision per product. Lives at `docs/vision.md`.
> Changes rarely (quarterly at most). All Features trace back to this.

## Meta
- **Owner:** Romain Piveteau
- **Last reviewed:** 2026-05-03
- **Status:** Active

## The North Star

Shopify merchants who outgrew vanilla checkout but can't justify $30k/yr Shopify Plus get a hosted checkout + booking layer they fully control — without leaving Shopify.

## Brand & domains

- **zedcheckout** — parent SaaS umbrella (marketing site at `www.zedcheckout.com`).
- **zedslot** — the booking product (V0). Hosted at `book.<merchant-domain>` via CNAME (pilot: `book.littlebiceps.com`); fallback to `<merchant>.zedslot.com`.
- Future products under the same umbrella: native loyalty/credit module (V0.1), product checkout (V2), headless CMS (V3).

## Who We Serve

- **Primary user:** small/medium **Shopify merchants with service businesses** (wellness, coaching, fitness, facility rental) where the existing Shopify + booking-app combo (BookThatApp, Sesami, Tipo) tanks conversion and frustrates regulars.
  - **Pilot customer:** Little Biceps (`https://littlebiceps.com`) — Parisian wellness institute, 4+ practitioners, single location, already on Shopify + BookThatApp, currently runs a hand-rolled checkout hack proving a +48% conversion lift on bookings.
- **Secondary users:** practitioners managing their own availability inside the merchant's admin (V1).

## Not for

- Pure-product Shopify stores (no booking need).
- Enterprises already on Shopify Plus with a custom checkout team.
- Merchants who want a full PMS / clinic-management suite (we're checkout + booking, not records management).

## The Wedge

A hosted, mobile-first, **no-cart, guest-by-default** booking checkout that ships measurably better conversion than the BookThatApp-on-Shopify combo. Proven preview: +48% lift on Little Biceps from the existing hack.

The wedge has four ingredients (each independently necessary):
1. **No Shopify cart** — direct slot → pay, no add-to-cart → view-cart → checkout detour.
2. **Custom payment UI** — Stripe Payment Element with Apple Pay / Google Pay surfaced first.
3. **Guest checkout by default** — auth only triggers when the customer wants to redeem pack/gift-card credit.
4. **Mobile-first** — the default Shopify + BookThatApp combo is hostile on mobile; ours is mobile-native.

## Non-Goals (for V0 specifically)

- Shopify App Store distribution (manual install for pilot).
- Multi-tenant onboarding UI (schema is multi-tenant-aware; only Little Biceps in prod).
- Native CRM / clinic notes / customer health records.
- Replacing Shopify checkout for pure-product orders (that's V2).
- Practitioner self-service availability UI (admin-managed in V0; self-service in V1).
- Group bookings / class capacity > 1 / pro training scheduling (V1).

## Success Signals (12 months)

- **≥ 3 paying merchants live** on the SaaS (post V1 multi-tenant extraction).
- **Pilot maintains ≥ +30% conversion lift** vs the pre-zedslot baseline at Little Biceps.
- **< 0.5% payment failure rate** across all tenants.
- **NPS ≥ 40** from merchant admins.
- **Pack-redemption attempt rate ≥ 60%** of returning customers with positive pack balance (proves the auth + integration story works).

## Anti-Signals

- The hosted checkout fails to maintain at least **+20% lift** over Little Biceps' current hack at full traffic — wedge thesis is wrong.
- More than **one manual reconciliation per week** between Shopify pack credit and zedslot — integration model is wrong.
- Less than **one paying customer** signed within 3 months of V1 GA — the SaaS thesis is wrong, even if the pilot works.

## Active Features

Pipeline. Each entry becomes a `docs/features/<slug>.md` file when work starts on it.

- [x] `docs/features/booking-pilot.md` — **V0** booking + hosted checkout for Little Biceps.
- [ ] `docs/features/native-loyalty-pack-credit.md` — **V0.1** native replacement for Froonze (loyalty + pack + discount + in-store credit). Replaces Shopify-as-source-of-truth for credit, with a migration tool to pull existing Froonze data.
- [ ] `docs/features/multi-tenant-saas-extraction.md` — **V1** tenant onboarding UI, automated CNAME provisioning, Stripe Connect, per-tenant feature-flag cohorts.
- [ ] `docs/features/practitioner-self-service.md` — **V1** practitioner login + own-availability management (gated to V1 because multi-tenant SaaS pricing depends on practitioner seat counts).
- [ ] `docs/features/group-bookings-and-classes.md` — **V1** capacity > 1 per slot, waitlist, pro training scheduling.
- [ ] `docs/features/product-checkout.md` — **V2** buy product + book session in one cart (impossible on Shopify today).
- [ ] `docs/features/headless-cms.md` — **V3** Payload-powered CMS for merchant marketing pages.

## North Star (V∞)

A real alternative to Shopify for service-led commerce. Triggers when ≥ 30% of zedslot tenants tell us they'd leave Shopify if zedslot did `<X>`. Until then it's a marketing position, not a build.
