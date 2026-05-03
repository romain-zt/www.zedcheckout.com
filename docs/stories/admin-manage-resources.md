# [STORY] Admin manages resources (practitioners) and their availability

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As an admin, I can create practitioners, set their recurring weekly working hours, and add one-off availability overrides (time off, special hours) — and the booking subdomain reflects those rules accurately.

## Acceptance Criteria

- [ ] PayloadCMS Resources collection: `name`, `email` (optional), `status: 'active' \| 'disabled'`.
- [ ] PayloadCMS AvailabilityRules collection (scoped to `resource:<id>`): `kind: 'recurring' \| 'override'`, `dayOfWeek?`, `startTime`, `endTime`, `dateRange?`.
- [ ] Recurring rule example: "Mon–Fri 9:00–18:00."
- [ ] Override examples: "2026-08-12 to 2026-08-26 — unavailable" (vacation); "2026-06-01 — 14:00–17:00 only" (special).
- [ ] Booking subdomain calls `listAvailableSlots` which composes recurring + override rules correctly: overrides win over recurring; "unavailable" overrides remove all matching slots.
- [ ] Disabling a practitioner hides them from new bookings immediately but preserves existing bookings.
- [ ] Time zone handling: rules stored in `Tenant.timezone`; converted to user-local time at display only.
- [ ] Visual weekly grid in Payload custom block to manage rules without raw form-typing.

## Specs

- [ ] `specs/resources-collection.md` — Payload collection schema
- [ ] `specs/availability-rules-collection.md` — schema + composition algorithm (override-wins-over-recurring)
- [ ] `specs/availability-editor-ui.md` — visual weekly grid Payload block

## Out of Scope (for this Story)

- Practitioner self-service login + own-availability editor (V1 — separate Feature).
- Per-practitioner pricing (V1+).
- Practitioner profile photos / public bios on the booking page (V1).
- Skill-based assignment (e.g., "this practitioner only does drainage, not facials") — currently handled via `Service.eligibleResources[]`, no separate skills system.

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Admin can configure all 4 Little Biceps practitioners (Oriane, Emmanuelle, Iris, Stéphanie) with their actual schedules end-to-end.
- [ ] Property test: for any composition of recurring + override rules, `listAvailableSlots` produces the same result as a hand-rolled reference.
- [ ] Booking subdomain shows correct slots within 60s of an availability change in admin.
