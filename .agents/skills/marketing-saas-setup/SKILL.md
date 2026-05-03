---
name: marketing-saas-setup
description: "Set up a complete SaaS marketing layer: landing page, pricing page with plan tiers, Stripe checkout, webhook, and subscription lifecycle. Use when adding monetization to an existing app or bootstrapping a new SaaS product."
---

# Marketing & SaaS Setup

Add a complete marketing and monetization layer to a Next.js app. Covers the full sales funnel from landing page to paid subscription.

## When to Use

- Adding monetization to an existing free app
- Bootstrapping a new SaaS product
- User says "add pricing", "set up payments", "create landing page", "add Stripe"
- Converting a side project into a paid product

## Deliverables

1. **Landing Page** (`/landing`) — hero, features grid, philosophy/values, final CTA
2. **Pricing Page** (`/pricing`) — plan comparison (Free/Pro/Annual), FAQ
3. **Stripe Integration** — checkout session, webhook, subscription lifecycle
4. **Sales Funnel** — visitor → landing → pricing → checkout → onboarding → app

## Implementation Checklist

### 1. Landing Page

```
src/app/landing/page.tsx
```

Structure:
- Fixed nav (logo + CTA)
- Hero: headline + subhead + 2 CTAs (primary: pricing, secondary: scroll)
- "How it works" section (3-5 steps)
- Features grid (2-col, 4-6 cards with emoji + title + desc)
- Social proof or philosophy section
- Final CTA
- Footer

Rules:
- Mobile-first (stack on mobile, grid on desktop)
- Touch targets ≥ 44px
- No stock photos — emojis or custom illustrations
- Copy: direct, no jargon, benefits over features
- Metadata: title + OG tags for sharing

### 2. Pricing Page

```
src/app/pricing/page.tsx
```

Structure:
- 3 plans: Free / Pro (monthly) / Annual (discounted)
- Highlight the Pro plan (ring/border treatment)
- Badge on Annual showing discount %
- Feature checklist per plan (Check icon for included, dash for excluded)
- FAQ section (4-5 questions)

Plan config:
```typescript
const PLANS = {
  pro: { priceId: env, price: 900, interval: "month", trialDays: 7 },
  annual: { priceId: env, price: 7900, interval: "year", trialDays: 7 },
};
```

### 3. Stripe Integration

```
src/lib/stripe.ts          — lazy client + plan config
src/app/api/checkout/route.ts  — creates Checkout Session
src/app/api/webhook/route.ts   — handles subscription events
```

Checkout flow:
1. User clicks plan CTA → `GET /api/checkout?plan=pro`
2. Server creates Stripe Checkout Session with trial
3. Redirect to Stripe hosted checkout
4. On success → redirect to `/onboarding?session_id=...`
5. Webhook confirms subscription activation

Webhook events to handle:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 4. Environment Variables

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 5. Layout Integration

Add marketing routes to minimal layout (no app chrome):
```typescript
const MINIMAL_ROUTES = ["/onboarding", "/landing", "/pricing"];
```

### 6. Sales Funnel Flow

```
/landing → /pricing → /api/checkout?plan=X → Stripe → /onboarding → /app
```

Free plan skips Stripe entirely: `/pricing` → `/onboarding` directly.

## Design Principles

- **Copy:** Simple, authentic, human. No "revolutionary" or "game-changing"
- **Pricing psychology:** Highlight middle tier, show savings on annual, anchor with features
- **Trust signals:** FAQ about cancellation, data privacy, no lock-in
- **Funnel:** Every page has exactly one primary action. No decision paralysis
- **Dark mode by default** for app-type products

## Dependencies

- `stripe` npm package
- Stripe account with Products and Prices configured
- Webhook endpoint registered in Stripe Dashboard

## Post-Setup

After deploying:
1. Create Products + Prices in Stripe Dashboard
2. Set price IDs in env vars
3. Register webhook URL: `https://yourdomain.com/api/webhook`
4. Enable webhook events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
5. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`

## Common Pitfalls

- Stripe SDK throws at import time if key is missing → use lazy init (Proxy pattern)
- Webhook needs raw body for signature verification → use `request.text()` not `.json()`
- Trial period requires `subscription_data.trial_period_days`, not billing cycle config
- Always set `allow_promotion_codes: true` for flexibility
- Marketing pages must be static (no DB calls) for performance
