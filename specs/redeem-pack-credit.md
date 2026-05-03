# [SPEC] Redeem pack / gift-card credit at booking checkout

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/redeem-pack-credit.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

Returning Little Biceps customers have prepaid pack credit (or gift card balances) stored in Shopify. They need to redeem this at booking checkout — fully covering the booking or splitting with card — without a complex auth flow. Currently there's no way to use pack credit at booking time.

## Solution

A magic-link email auth flow triggered only when the customer taps "Use my pack credit." After auth, the system reads the customer's balance from Shopify, displays it, and orchestrates a two-phase payment: reserve credit → charge card (if split) → debit credit on card success / release on failure. The `pack_redemption_enabled` feature flag acts as a kill switch if Shopify is down.

## Scope

### In Scope
- "Use my pack credit" / "Use a gift card" affordance on checkout (secondary, non-blocking)
- Email magic-link auth flow (issue → validate → session cookie)
- Balance lookup from Shopify Customer Account API + metafield
- Credit-only payment (no Stripe charge when credit ≥ total)
- Split payment (credit + card) with two-phase orchestration
- Pack hold: reserve credit in `pack_holds` table with 15-min expiry
- Hold release on card failure or expiry
- `pack_redemption_enabled` kill switch (feature flag)
- Idempotent credit debit via Shopify metafield with idempotency keys

### Out of Scope
- Native loyalty / pack management (V0.1)
- Admin pack credit adjustment (see `specs/admin-bookings-and-refunds.md`)
- Gift card issuance / purchase
- POS / in-store credit usage

## Technical Design

### Data Models

```ts
// packages/domain/src/entities/pack-hold.ts
interface PackHold {
  id: string;
  tenantId: string;
  customerId: string;
  bookingId: string;
  amountCents: number;
  status: 'held' | 'debited' | 'released';
  expiresAt: Date;
  createdAt: Date;
}

// packages/domain/src/value-objects/split-payment.ts
interface SplitPaymentBreakdown {
  totalCents: number;
  packCreditCents: number;
  giftCardCents: number;
  cardCents: number;
  currency: string;
}
```

### DB Tables (Drizzle)

```ts
export const packHoldStatusEnum = pgEnum('pack_hold_status', ['held', 'debited', 'released']);

export const packHolds = pgTable('pack_holds', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  amountCents: integer('amount_cents').notNull(),
  status: packHoldStatusEnum('status').notNull().default('held'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### API / Interfaces

#### `POST /api/auth/magic-link`
Issues a magic link email.
```ts
Request: { email: string; tenantId: string; returnTo: string }
Response: { sent: true }
```
Rate limit: 3 per email per 10 min.

#### `GET /api/auth/verify?token={token}`
Validates magic link token, sets session cookie, redirects to `returnTo`.
```ts
Token: signed JWT with { email, tenantId, exp: 30min }
Cookie: httpOnly, sameSite=lax, secure, 24h expiry
```

#### `GET /api/customer/balance`
Returns pack + gift card balance for authenticated customer.
```ts
Response: { packCreditCents: number; giftCardBalanceCents: number; email: string }
```
Reads from Shopify Customer Account API. Cache: 5min during outage.

#### `POST /api/bookings` (extended from book-as-guest-card)
When authenticated, accepts additional fields:
```ts
Request: {
  ...baseFields,
  paymentMethod: 'card' | 'credit' | 'split';
  creditAmountCents?: number; // how much credit to use
}
```

### Two-Phase Orchestration State Machine

```
1. RESERVE
   - Validate customer balance ≥ creditAmountCents
   - Decrement customers.pack_credit_cents
   - Insert pack_holds row (status='held', expires_at=now+15min)
   - Create Booking (status='pending')

2. CHARGE (if cardCents > 0)
   - Create PaymentIntent for cardCents only
   - Stripe Payment Element confirm

3a. SUCCESS (payment_intent.succeeded)
   - Booking → confirmed
   - PackHold → debited
   - Write debit to Shopify metafield (idempotency key = packHold.id)
   - Queue confirmation email

3b. FAILURE (payment_intent.payment_failed)
   - PackHold → released
   - Re-credit customers.pack_credit_cents
   - Booking → cancelled

4. EXPIRY (background job)
   - PackHold.status='held' AND expiresAt < now
   - PackHold → released
   - Re-credit customers.pack_credit_cents
   - Booking → cancelled (if still pending)
```

### Dependencies
- `packages/domain` — PackHold entity, SplitPaymentBreakdown value object
- `packages/booking-engine` — `calculateSplitPayment(total, packBalance, giftBalance)`
- `packages/auth` — magic-link issuance, verification, session management
- `packages/shopify` — `getCustomerByEmail`, `getCustomerCredit`, `setCustomerCredit`
- `packages/shopify/__test-double` — for tests
- `packages/payments` — PaymentIntent for card portion
- `packages/database` — pack_holds table, customer balance queries
- `packages/feature-flags` — `pack_redemption_enabled` flag

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Reserve pack credit | `(bookingId, customerId)` | Return existing hold if active |
| Debit to Shopify | `packHold.id` | Shopify metafield write with idempotency key |
| Release hold | `packHold.id` | No-op if already released or debited |
| Magic-link send | `(email, 10min window)` | Rate limit, not idempotent (new token each time) |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Credit ≥ total | No card form shown; "Pay with credit" is primary; no Stripe charge |
| Credit < total | Split UI: "€X from credit + €Y by card"; card form for remainder |
| Credit = 0 | Same as guest flow; credit affordance still visible but shows "No balance" |
| Shopify API down | `pack_redemption_enabled` flag off → affordance hidden; "temporarily unavailable" message |
| Card fails on split payment | Pack hold released; customer retries; new hold created |
| Pack hold expires (15min) | Hold released; customer must re-authenticate and retry |
| Double-submit on credit-only | Idempotent: same booking returned if pending exists |
| Customer balance changes between auth and payment | Re-read balance at reserve time; fail if insufficient |
| Magic-link clicked on different device | Token is device-agnostic; session set on clicking device; original tab shows "authenticated" on poll |
| Magic-link expired (30min) | "Link expired" page with re-send option |
| Webhook replay on split payment | Idempotent: packHold already debited → no-op |

## Definition of Done

- [ ] `packages/domain`: `PackHold` entity, `SplitPaymentBreakdown` value object
- [ ] `packages/booking-engine`: `calculateSplitPayment` pure function with property tests
- [ ] `packages/auth`: magic-link issue + verify + session cookie (test double for email sending)
- [ ] `packages/shopify`: balance lookup + credit write wrappers (test double for Shopify API)
- [ ] `packages/database`: `pack_holds` table schema + migration
- [ ] Two-phase orchestration: reserve → charge → debit/release fully tested
- [ ] Hold expiry background job tested
- [ ] Idempotency: replay of payment-confirm never double-debits credit
- [ ] Kill switch: `pack_redemption_enabled=false` → UI degrades gracefully
- [ ] Property test: `calculateSplitPayment` conserves total (pack + gift + card = total, no rounding loss)
- [ ] No Shopify imports outside `packages/shopify`
- [ ] Integration test with shopify test double: auth → balance → reserve → charge → debit

## Open Questions

- [x] Gift card balance lookup uses same Shopify metafield path (confirmed by architecture doc)
- [x] Pack credit source of truth is Shopify in V0, moves to zedslot in V0.1 (confirmed by CONTEXT.md)
