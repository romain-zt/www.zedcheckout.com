# [SPEC] Admin manages rooms

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/admin-manage-rooms.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

Rooms are a physical constraint — practitioners outnumber rooms at Little Biceps. The system must track room availability, support room-only services (room renting without a practitioner), and enforce the no-overlap constraint.

## Solution

PayloadCMS `rooms` collection. Rooms have their own availability rules (same schema as resources, scoped to `room:<id>`). Room auto-assignment picks the first eligible+available room. The EXCLUDE constraint on `(tenant_id, room_id, tstzrange)` prevents double-booking.

## Scope

### In Scope
- PayloadCMS Rooms collection (name, bookableWithoutResource, status)
- Room-scoped availability rules (recurring + override)
- Room auto-assignment in booking flow
- Room-only services (`requiresResource=false, requiresRoom=true`)

### Out of Scope
- Per-room pricing modifiers
- Room photos / capacity > 1
- Room equipment metadata

## Technical Design

### Data Models

```ts
// packages/domain/src/entities/room.ts
interface Room {
  id: string;
  tenantId: string;
  name: string;
  bookableWithoutResource: boolean;
  status: 'active' | 'disabled';
  createdAt: Date;
}
```

### DB Tables (Drizzle)

```ts
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  bookableWithoutResource: boolean('bookable_without_resource').notNull().default(false),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

Room availability uses the same `availability_rules` table with `scope='room:<id>'`.

### Room Auto-Assignment (booking-engine)

```ts
// packages/booking-engine/src/room-assignment.ts
function assignRoom(
  eligibleRoomIds: string[],
  existingBookings: Booking[],
  startsAt: Date,
  endsAt: Date,
): string | null {
  // Sort eligible rooms by ID (deterministic)
  // Return first room with no overlapping confirmed/pending booking
  // Return null if no room available
}
```

### Dependencies
- `packages/domain` — `Room` entity
- `packages/booking-engine` — `assignRoom`
- `packages/database` — rooms table (availability_rules shared)

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Create room | N/A (admin action) | Standard Payload create |
| Auto-assign room | Deterministic | Same inputs → same room (sorted by ID) |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| All eligible rooms booked for a slot | Slot not shown as available |
| Room-only service | No practitioner picker shown; room picker shown instead |
| Single eligible room | Auto-selected; no picker |
| Room disabled with confirmed bookings | Existing bookings preserved; room hidden from new |
| Two practitioners need rooms at same time | Each gets a different room; if only one room → one slot blocked |

## Definition of Done

- [ ] `packages/domain`: `Room` entity typed
- [ ] `packages/database`: rooms table + migration
- [ ] `packages/booking-engine`: `assignRoom` with unit tests
- [ ] PayloadCMS: Rooms collection
- [ ] Room-scoped availability rules working
- [ ] EXCLUDE constraint covers room overlap (from no-double-booking spec)
- [ ] Room-only service bookable end-to-end

## Open Questions

- [x] Room assignment is first-available by ID sort (confirmed; no preference system in V0)
