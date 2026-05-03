# [SPEC] No double-booking guarantee

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/no-double-booking-guarantee.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

Two customers booking overlapping slots on the same room or practitioner simultaneously must never both succeed. A single double-booking incident is a P0 — it breaks customer trust and practitioner schedules. Application-layer checks alone are insufficient due to TOCTOU races.

## Solution

Two-layer defense: (1) Postgres `EXCLUDE` constraints with `tstzrange` on `(tenant_id, room_id, time_range)` and `(tenant_id, resource_id, time_range)` — the real safety net. (2) Application-layer `canBook` pre-check for friendly UX before payment is attempted.

## Scope

### In Scope
- Postgres EXCLUDE constraints (room overlap + resource overlap)
- GiST index for constraint enforcement
- `canBook` application-layer pre-check (booking-engine, pure function)
- 409 `BOOKING_CONFLICT` error response
- Pending booking cleanup (15-min expiry job)
- Conflict error → next-available-slot suggestion

### Out of Scope
- Capacity > 1 per slot (group bookings — V1)
- Buffer/setup time between bookings (V1+)
- Travel time between rooms (single location in V0)
- Waitlist on conflict (V1)

## Technical Design

### DB Constraints (Migration SQL)

```sql
-- Requires btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Room overlap constraint: no two confirmed bookings on same room at overlapping times
ALTER TABLE bookings ADD CONSTRAINT no_room_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    room_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'confirmed');

-- Resource overlap constraint: no two confirmed bookings on same practitioner at overlapping times
ALTER TABLE bookings ADD CONSTRAINT no_resource_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    resource_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'confirmed' AND resource_id IS NOT NULL);
```

These are partial EXCLUDE constraints (filtered by `status = 'confirmed'`). Pending bookings are NOT constrained — only the confirm step is race-safe.

### Application Pre-Check (`packages/booking-engine`)

```ts
// packages/booking-engine/src/can-book.ts
type ConflictReason =
  | { type: 'ROOM_CONFLICT'; conflictingBookingId: string }
  | { type: 'RESOURCE_CONFLICT'; conflictingBookingId: string }
  | { type: 'SERVICE_DISABLED' }
  | { type: 'OUTSIDE_AVAILABILITY' };

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function canBook(
  slot: Slot,
  existingBookings: Booking[],  // confirmed + pending for same room/resource/timerange
  service: Service,
): Result<true, ConflictReason>
```

Pre-check runs:
1. At **slot selection** time — to grey out taken slots in the UI
2. At **booking creation** time — before inserting pending booking
3. At **booking confirmation** time — before transitioning pending → confirmed

Even if pre-check passes, the DB constraint is the final authority on confirm.

### Conflict Error Handling

When the DB EXCLUDE constraint fires on `INSERT/UPDATE`:
```
Postgres error code: 23P01 (exclusion_violation)
```

The database layer catches this and throws a typed `BookingConflictError`:
```ts
// packages/database/src/errors.ts
class BookingConflictError extends Error {
  code = 'BOOKING_CONFLICT' as const;
  constructor(public dimension: 'room' | 'resource') { super(`Booking conflict on ${dimension}`); }
}
```

API returns:
```ts
// HTTP 409
{
  error: 'BOOKING_CONFLICT',
  message: 'That slot was just taken',
  nextAvailable: { startsAt: string; endsAt: string; resourceId: string | null; roomId: string } | null
}
```

### Pending Booking Expiry Job

Runs every 5 minutes (Vercel Cron or `apps/api` cron route):
```ts
async function expirePendingBookings(db: TenantScopedDb): Promise<number> {
  // 1. Find all bookings where status='pending' AND createdAt < now - 15min
  // 2. For each: set status='cancelled'
  // 3. Release any pack_holds (set status='released', re-credit customer)
  // 4. Return count of expired bookings
}
```

Pending bookings are visible to admin but excluded from customer-facing slot availability (they DO block slots during hold period for the holder, but `listAvailableSlots` treats them as "taken" to prevent other customers from picking them).

### Data Models

No new entities beyond `Booking` (see `specs/book-as-guest-card.md`). The EXCLUDE constraints are DDL on the existing `bookings` table.

### Dependencies
- `packages/database` — migration with EXCLUDE constraints + btree_gist
- `packages/booking-engine` — `canBook` pure function
- `packages/domain` — `Booking`, `Slot`, `ConflictReason` types

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Confirm booking | `booking.id` | No-op if already confirmed |
| Expire pending | `booking.id` | No-op if already cancelled/confirmed |
| Release pack hold | `packHold.id` | No-op if already released/debited |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Two simultaneous confirms for same room+time | One commits, other gets constraint violation → 409 |
| Two simultaneous confirms for same resource+time | One commits, other gets constraint violation → 409 |
| Pending booking blocks slot for holder | Other customers see slot as unavailable during 15-min hold |
| Pending booking expires | Slot released; becomes available to others |
| Confirm after expiry | Booking already cancelled; API returns 410 Gone |
| Service requires resource=false, requires room=true | Only room constraint fires; no resource constraint |
| Resource is null (room-only service) | Resource EXCLUDE constraint has `WHERE resource_id IS NOT NULL` → no conflict check on null |
| Admin cancels booking | Slot immediately freed; EXCLUDE constraint no longer blocks |
| Reschedule race | Old slot released + new slot acquired in same transaction; EXCLUDE guards both |
| 100 concurrent booking attempts for 10 slots | Exactly 10 confirmed; 90 get 409; zero double-bookings; zero orphaned pending |

## Definition of Done

- [ ] `btree_gist` extension enabled in migration
- [ ] `no_room_overlap` EXCLUDE constraint in migration
- [ ] `no_resource_overlap` EXCLUDE constraint in migration
- [ ] `BookingConflictError` typed error in `packages/database`
- [ ] `canBook` pre-check function in `packages/booking-engine` with unit tests
- [ ] API returns 409 with `BOOKING_CONFLICT` code + next-available suggestion
- [ ] Pending expiry job: cancels stale pending bookings, releases holds
- [ ] Property test: for any sequence of concurrent booking attempts, no two confirmed bookings overlap on room or resource
- [ ] Property test: `canBook` agrees with EXCLUDE constraint for all non-race scenarios
- [ ] Load test scenario: 100 concurrent → 10 confirmed, 90 rejected, 0 double-booked
- [ ] No orphaned pending bookings after expiry job runs

## Open Questions

- [x] Pending bookings block other customers (confirmed: yes, they appear as "taken" in slot list)
- [x] Partial EXCLUDE constraint syntax supported by Neon Postgres (confirmed: Neon is standard Postgres 15+)
