# [SPEC] Admin bookings view, overrides, and manual refunds

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/admin-bookings-and-refunds.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

Admin needs visibility into all bookings, ability to override statuses (mark no-show, completed, cancelled), trigger manual refunds (with policy override), and manage customer pack credit. Every override must be auditable.

## Solution

PayloadCMS bookings collection (read-mostly) with list + calendar views, status override actions, manual refund flow, and customer detail view. All overrides recorded in an `audit_logs` table.

## Scope

### In Scope
- Bookings list view (filters: date, resource, room, status, email)
- Booking detail view with status override actions
- Mark as completed, no_show, cancelled (with refund options)
- Manual refund: full or partial, with admin-configurable allocation
- Customer view: history, balances, manual credit adjustment
- Audit log for all admin actions

### Out of Scope
- Admin-initiated booking creation (V1)
- Bulk operations
- Reporting / dashboards
- Practitioner role access
- Calendar drag-to-reschedule (V1)

## Technical Design

### Data Models

```ts
// packages/domain/src/entities/audit-log.ts
interface AuditLog {
  id: string;
  tenantId: string;
  entityType: 'booking' | 'payment' | 'refund' | 'customer';
  entityId: string;
  action: string;       // 'status_override', 'manual_refund', 'credit_adjustment'
  actor: string;        // admin user ID
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  reason: string;
  createdAt: Date;
}
```

### DB Tables (Drizzle)

```ts
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(),
  actor: text('actor').notNull(),
  before: jsonb('before'),
  after: jsonb('after'),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### Admin Actions

#### Mark as `completed`
- Booking.status → `completed`
- Irreversible
- Audit log entry

#### Mark as `no_show`
- Booking.status → `no_show`
- Triggers `noShowBehavior` from snapshotted policy:
  - `charged`: no refund
  - `refundable`: full refund to source
  - `partial`: 50% refund to source
- Admin can override the automatic financial outcome
- Audit log entry

#### Cancel with refund (admin override)
- Admin chooses: refund-to-source (default), refund-as-credit, or no refund
- Required reason field
- Uses same refund-to-source engine as customer flow
- Audit log entry

#### Manual credit adjustment
- Admin enters amount (positive or negative) + required reason
- Writes to `customers.pack_credit_cents` locally
- Syncs to Shopify metafield via `packages/shopify` with idempotency key
- Audit log entry

### Dependencies
- `packages/domain` — `AuditLog` entity
- `packages/booking-engine` — `splitRefund`, `applyPolicy`
- `packages/payments` — `createRefund` for card portion
- `packages/shopify` — `setCustomerCredit` for pack adjustments
- `packages/database` — audit_logs table, booking queries
- PayloadCMS (apps/admin) — collections + custom blocks

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Status override | `(bookingId, action, timestamp)` | Audit log prevents silent duplicates |
| Manual refund | `refund.id` | Same as customer-initiated refund |
| Credit adjustment | `auditLog.id` as Shopify idempotency key | Prevents double-write |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Admin cancels already-cancelled booking | Blocked with message |
| Admin marks completed on a cancelled booking | Blocked |
| Partial refund > paid amount | Validation error |
| Credit adjustment to negative balance | Allowed (can represent debt); UI shows warning |
| Concurrent admin edits on same booking | Last-write-wins with optimistic lock (updatedAt check) |
| Shopify metafield write fails on credit adjustment | Retry queue; admin alert; local balance updated immediately |

## Definition of Done

- [ ] `packages/domain`: `AuditLog` entity typed
- [ ] `packages/database`: audit_logs table + migration
- [ ] PayloadCMS: Bookings collection (list + detail views)
- [ ] Status override actions with audit logging
- [ ] Manual refund flow using `splitRefund` engine
- [ ] Customer view with history + credit adjustment
- [ ] Audit log entries for every override action
- [ ] Integration test: admin cancel → refund created → audit log written
- [ ] Required reason field enforced on all overrides

## Open Questions

- [x] Calendar view is a Payload custom block (confirmed; weekly/daily grid, V0 is basic)
