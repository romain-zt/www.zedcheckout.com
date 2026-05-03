# [STORY] No double-booking guarantee

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0 (system-level invariant — applies to every booking flow)
- **Created:** 2026-05-03

## User Statement

> As the system, I cannot accept two confirmed bookings that conflict on the same room or the same resource — even when two customers attempt to book overlapping slots simultaneously.

## Acceptance Criteria

- [ ] Postgres `EXCLUDE` constraint on `bookings(tenant_id, room_id, tstzrange(starts_at, ends_at, '[)'))` for `status = 'confirmed'` is in place and enforced.
- [ ] Postgres `EXCLUDE` constraint on `bookings(tenant_id, resource_id, tstzrange(starts_at, ends_at, '[)'))` for `status = 'confirmed' AND resource_id IS NOT NULL` is in place and enforced.
- [ ] Application-layer `canBook` pre-check runs at slot-pick time and at payment-confirm time.
- [ ] On constraint violation at confirm time, API returns HTTP 409 with a structured error code (`BOOKING_CONFLICT`).
- [ ] UI handles 409 by surfacing a friendly message ("That slot was just taken") and offering the next available slot for the same service/practitioner combination.
- [ ] No partial state is left behind on conflict: `Booking(status='pending')` is rolled back, pack hold (if any) is released, no Stripe charge has been attempted yet (pre-check + DB constraint both fire before card capture).
- [ ] Pending bookings (15-min hold) are excluded from `canBook` checks but visible to admin so accidental holds can be released manually.

## Specs

- [ ] `specs/db-exclude-constraints.md` — DDL, gist index, partial-index conditions, migration plan
- [ ] `specs/conflict-detection-pre-check.md` — application-layer logic, when it runs, how it composes with the DB constraint
- [ ] `specs/conflict-error-handling-ux.md` — 409 → "next available slot" UX flow

## Out of Scope (for this Story)

- Capacity > 1 per slot (group bookings — V1).
- Buffer / setup time between bookings (V1+ — could be modeled as artificial duration extension or separate "buffer" entity).
- Travel time between rooms (not relevant single-location).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Load test: 100 concurrent visitors competing for 10 slots → exactly 10 confirmed bookings, 90 friendly conflict errors, zero double-bookings, zero orphaned pending bookings.
- [ ] Property test: for any sequence of booking attempts (including failed confirms, expired holds, retries), no two confirmed bookings overlap on room or resource.
- [ ] Production monitor: PostHog event `booking_conflict_409` tracked; alert if rate > 5% (signals UX issue surfacing too many conflicts).
