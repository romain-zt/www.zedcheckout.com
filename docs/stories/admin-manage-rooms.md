# [STORY] Admin manages rooms

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As an admin, I can create rooms, mark them as bookable-without-resource, and set their availability — so customers can book a room directly (room renting) and the system can prevent double-booking when practitioners outnumber rooms.

## Acceptance Criteria

- [ ] PayloadCMS Rooms collection: `name`, `bookableWithoutResource (bool)`, `status: 'active' \| 'disabled'`.
- [ ] AvailabilityRules can be scoped to `room:<id>` with the same recurring + override semantics as resources.
- [ ] If `Service.requiresRoom = true` and `requiresResource = false` → the booking flow shows the room picker (or auto-selects the only eligible room).
- [ ] If `Service.requiresRoom = true` and `requiresResource = true` → the booking flow assigns a room automatically (first eligible + available); admin can override in V1.
- [ ] No two confirmed bookings can occupy the same room at overlapping times (Postgres EXCLUDE constraint enforces this).
- [ ] Room-only services (e.g., room rental) appear in the catalog like any other Service, with `requiresResource = false`.
- [ ] Disabling a room hides it from new bookings immediately; preserves existing bookings.

## Specs

- [ ] `specs/rooms-collection.md` — Payload collection schema
- [ ] `specs/room-allocation-policy.md` — auto-assignment algorithm when multiple rooms are eligible
- [ ] `specs/room-only-booking-ux.md` — UI variant for `requiresResource = false` services

## Out of Scope (for this Story)

- Per-room pricing modifiers (V1+).
- Room photos / capacity > 1 (V1 with group bookings).
- Room equipment metadata (V1+).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Little Biceps' actual rooms configured (count + names confirmed during onboarding).
- [ ] At least one Service set up as `requiresResource = false, requiresRoom = true` (room-rental scenario) and bookable end-to-end.
- [ ] Race test: 2 customers attempting overlapping bookings on the same room → exactly one succeeds, one gets 409 + retry UI.
