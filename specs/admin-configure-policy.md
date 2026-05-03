# [SPEC] Admin configures cancellation / refund / reschedule policy

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/admin-configure-policy.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

The admin needs to define the rules for cancellation, no-show, and rescheduling behavior. These rules must be snapshotted at booking creation time so changing the policy doesn't retroactively affect existing bookings.

## Solution

PayloadCMS `policies` collection with one global row per tenant. `Booking.policyId` references the active policy at creation time. Policies are versioned (new row on edit, old row kept for snapshots). Sensible defaults pre-seeded.

## Scope

### In Scope
- Policy entity with: freeCancelHours, lateCancelBehavior, noShowBehavior, freeRescheduleHours, maxReschedules
- Global scope (one per tenant in V0; `scope` field ready for per-service in V1)
- Policy snapshot on booking creation
- Default policy pre-seeded
- Refund-to-source (hard-coded, NOT configurable)
- Policy display strings in i18n (FR/EN)

### Out of Scope
- Per-service policy overrides UI
- Policy A/B testing
- Policy version history UI

## Technical Design

### Data Models

```ts
// packages/domain/src/entities/policy.ts
type PolicyScope = 'global' | `service:${string}`;
type LateCancelBehavior = 'credit' | 'none';
type NoShowBehavior = 'charged' | 'refundable' | 'partial';

interface Policy {
  id: string;
  tenantId: string;
  scope: PolicyScope;
  freeCancelHours: number;
  lateCancelBehavior: LateCancelBehavior;
  noShowBehavior: NoShowBehavior;
  freeRescheduleHours: number;
  maxReschedules: number;
  createdAt: Date;
}
```

### DB Tables (Drizzle)

```ts
export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  scope: text('scope').notNull().default('global'),
  freeCancelHours: integer('free_cancel_hours').notNull().default(24),
  lateCancelBehavior: text('late_cancel_behavior', { enum: ['credit', 'none'] }).notNull().default('credit'),
  noShowBehavior: text('no_show_behavior', { enum: ['charged', 'refundable', 'partial'] }).notNull().default('charged'),
  freeRescheduleHours: integer('free_reschedule_hours').notNull().default(24),
  maxReschedules: integer('max_reschedules').notNull().default(2),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### Policy Application (booking-engine)

```ts
// packages/booking-engine/src/policy.ts
function applyPolicy(
  booking: Booking,
  policy: Policy,
  now: Date,
): CancellationOutcome {
  const hoursUntilStart = (booking.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilStart >= policy.freeCancelHours) return { type: 'FREE_CANCEL' };
  if (policy.lateCancelBehavior === 'credit') return { type: 'LATE_CANCEL_CREDIT' };
  return { type: 'LATE_CANCEL_NO_REFUND' };
}

function canReschedule(booking: Booking, policy: Policy, now: Date): boolean {
  const hoursUntilStart = (booking.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilStart >= policy.freeRescheduleHours && booking.rescheduleCount < policy.maxReschedules;
}

function formatPolicyText(policy: Policy, locale: 'fr' | 'en'): string;
```

### Policy Snapshot Mechanism

On booking creation:
1. Read current global policy for tenant (`scope='global'`)
2. Set `Booking.policyId = policy.id`
3. If admin later edits the policy, a new policy row is created (Payload hook: on `beforeChange`, create new row instead of updating)
4. Old row retained for existing booking snapshots

### Dependencies
- `packages/domain` — `Policy` entity, `CancellationOutcome` type
- `packages/booking-engine` — `applyPolicy`, `canReschedule`, `formatPolicyText`
- `packages/database` — policies table

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Policy snapshot | `booking.policyId` | Set once on creation; never updated |
| Policy edit | Creates new row | Old rows immutable |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Cancel exactly at freeCancelHours boundary | Inclusive: still free cancel |
| Cancel 1 minute after boundary | Late cancel behavior applies |
| Reschedule at max count | Blocked; "cancel and rebook" suggested |
| Policy edited mid-day | Existing bookings retain old policy; new bookings get new |
| No policy exists for tenant | Seed default on tenant creation; booking creation fails if no policy (safety) |
| Booking starts in < 0 hours (past) | Cancel blocked; admin override only |

## Definition of Done

- [ ] `packages/domain`: `Policy` entity, `CancellationOutcome`, `LateCancelBehavior`, `NoShowBehavior` types
- [ ] `packages/database`: policies table + migration + default seed
- [ ] `packages/booking-engine`: `applyPolicy`, `canReschedule`, `formatPolicyText` with unit tests
- [ ] PayloadCMS: Policies collection with edit-creates-new-row hook
- [ ] Booking creation sets `policyId` from active global policy
- [ ] Property test: changing policy doesn't affect existing bookings' cancellation outcome
- [ ] Policy display strings in FR + EN
- [ ] Refund-to-source hard-coded (not a policy option)

## Open Questions

- [x] Single global policy per tenant in V0 (confirmed; per-service via scope field in V1)
