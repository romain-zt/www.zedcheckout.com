# [SPEC] Customer cancels or reschedules booking

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/customer-cancel-or-reschedule.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

Customers need to cancel or reschedule bookings via a link in their email. The refund must return to the original payment source (card→card, pack→pack, split→split). Reschedules must be atomic (new slot acquired + old released in one transaction) and subject to policy limits.

## Solution

"Manage booking" page accessible via signed one-tap auth token from emails. Shows booking details, policy, and available actions. Cancellation triggers the refund-to-source engine. Reschedule is an atomic slot swap. Both respect the snapshotted policy.

## Scope

### In Scope
- Manage booking page (accessible via signed token from email)
- Cancel within free window → full refund to source
- Cancel after window → behavior per policy (credit or no refund)
- Reschedule within window → atomic slot swap, no payment change
- Reschedule blocked when max count reached or outside window
- Refund-to-source engine (card→card, pack→pack, exact split)
- Cancellation email triggered on cancel
- Audit trail for cancel/reschedule actions

### Out of Scope
- Admin-initiated cancel/reschedule (see admin-bookings-and-refunds spec)
- Bulk operations
- Reschedule to different service
- Partial refunds (admin-only)

## Technical Design

### Refund-to-Source Engine (booking-engine)

```ts
// packages/booking-engine/src/refund.ts
interface RefundAllocation {
  refundToCardCents: number;
  refundToPackCents: number;
  refundToGiftCardCents: number;
}

function splitRefund(
  payment: Payment,
  totalToRefundCents: number,
): RefundAllocation {
  // Proportional split matching original payment sources
  // Card portion: Math.floor(totalToRefundCents * payment.paidByCardCents / payment.totalCents)
  // Pack portion: Math.floor(totalToRefundCents * payment.paidByPackCents / payment.totalCents)
  // Gift card: totalToRefundCents - card - pack (gets any rounding remainder)
  // Invariant: card + pack + giftCard === totalToRefundCents (exact)
}
```

### DB Tables (Drizzle)

```ts
export const refunds = pgTable('refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  paymentId: uuid('payment_id').notNull().references(() => payments.id),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  refundedToCardCents: integer('refunded_to_card_cents').notNull().default(0),
  refundedToPackCents: integer('refunded_to_pack_cents').notNull().default(0),
  refundedToGiftCardCents: integer('refunded_to_gift_card_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
```

### API / Interfaces

#### `GET /api/bookings/{id}/manage?token={signedToken}`
Returns booking details + available actions based on policy.
```ts
Response: {
  booking: BookingDetails;
  policy: { freeCancelHours, freeRescheduleHours, maxReschedules };
  actions: {
    canCancel: boolean;
    cancelOutcome: 'full_refund' | 'credit_refund' | 'no_refund';
    canReschedule: boolean;
    rescheduleBlockedReason?: string;
  };
}
```

#### `POST /api/bookings/{id}/cancel`
Cancels booking, triggers refund.
```ts
Request: { token: string; reason?: string }
Response: { refund: { toCard: number; toPack: number; toGiftCard: number } }
```

#### `POST /api/bookings/{id}/reschedule`
Atomic reschedule to new slot.
```ts
Request: { token: string; newStartsAt: string; newResourceId?: string; newRoomId: string }
Response: { booking: BookingDetails }
```

### Reschedule State Machine

```
1. Validate: canReschedule(booking, policy, now) === true
2. In single DB transaction:
   a. canBook(newSlot, existingBookings) — pre-check
   b. Update booking: new startsAt, endsAt, resourceId, roomId, rescheduleCount++
   c. EXCLUDE constraint guards the new slot
3. If constraint violation → 409 (slot taken)
4. Queue new confirmation email
5. Delete pending reminder for old slot; schedule new reminder
```

### Dependencies
- `packages/domain` — `Refund` entity, `RefundAllocation` value object
- `packages/booking-engine` — `splitRefund`, `applyPolicy`, `canReschedule`
- `packages/payments` — `createRefund` (Stripe refund for card portion)
- `packages/shopify` — `setCustomerCredit` (re-credit pack on refund)
- `packages/database` — refunds table, booking update
- `packages/email` — cancellation email

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Cancel booking | `booking.id` | No-op if already cancelled |
| Create refund | `(bookingId, paymentId)` | UNIQUE constraint prevents duplicates |
| Stripe refund | `refund.id` as idempotency key | Stripe deduplicates |
| Pack credit restore | `refund.id` | Shopify metafield write with idempotency key |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Cancel at exactly freeCancelHours boundary | Free cancel (inclusive) |
| Split payment refund (€60 pack + €80 card) | Exact: €60 to pack, €80 to card |
| Stripe refund fails (expired card) | Refund stays `processing`; retry queue; admin alert |
| Reschedule to slot that gets taken during transaction | EXCLUDE constraint → 409; offer alternatives |
| Reschedule at max count | Blocked; suggest "cancel and rebook" |
| Auth token expired | "Link expired" with re-send option |
| Cancel already-cancelled booking | 400 "Booking already cancelled" |
| Cancel a completed booking | Blocked; admin override only |
| Refund amount calculation with rounding | Last source absorbs remainder — zero rounding loss |

## Definition of Done

- [ ] `packages/domain`: `Refund` entity typed
- [ ] `packages/database`: refunds table + migration
- [ ] `packages/booking-engine`: `splitRefund` with property tests (total conservation)
- [ ] `packages/booking-engine`: `applyPolicy` + `canReschedule` (from policy spec)
- [ ] API routes: manage, cancel, reschedule with signed token auth
- [ ] Refund-to-source: card portion → Stripe, pack portion → Shopify metafield
- [ ] Reschedule: atomic slot swap in single transaction
- [ ] Cancellation email triggered on cancel
- [ ] Property test: for any payment split, `splitRefund` conserves total exactly
- [ ] Integration test: cancel → refund created → Stripe refund (test double) → pack credit (test double)
- [ ] No float math in refund calculations

## Open Questions

- [x] Refund-to-source is non-configurable (confirmed: hard rule per booking.mdc)
- [x] Late cancel with `credit` behavior: card portion converted to pack credit (confirmed by story)
