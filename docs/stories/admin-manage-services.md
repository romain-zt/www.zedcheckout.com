# [STORY] Admin manages services

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As an admin, I can create, edit, enable, and disable Services in PayloadCMS — setting name (per language), duration, price, eligible practitioners, eligible rooms, and whether the service requires a practitioner or just a room.

## Acceptance Criteria

- [ ] PayloadCMS Services collection exists with fields: `name` (i18n), `description` (i18n, optional), `durationMinutes`, `priceCents`, `eligibleResources[]`, `eligibleRooms[]`, `requiresResource (bool)`, `requiresRoom (bool)`, `status: 'active' \| 'disabled'`.
- [ ] Validation: `requiresResource = true` → `eligibleResources[]` must be non-empty; `requiresRoom = true` → `eligibleRooms[]` must be non-empty.
- [ ] Disabling a Service hides it from the booking subdomain immediately (no caching layer that holds it stale > 60s).
- [ ] Editing a Service does not affect existing confirmed bookings.
- [ ] Deleting a Service is forbidden if confirmed bookings reference it; admin must disable instead.
- [ ] Audit log: every create/edit/disable records actor + timestamp.
- [ ] Practitioner role (V1) can read but not edit Services.

## Specs

- [ ] `specs/services-collection.md` — Payload collection schema, validation, hooks
- [ ] `specs/service-cache-invalidation.md` — how booking subdomain learns about Service changes (Next.js revalidation + tag-based invalidation)

## Out of Scope (for this Story)

- Per-service policy overrides (data model supports it; UI ships single global policy).
- Per-practitioner pricing (data model supports it; UI ships single price).
- Service categories / collections (V1).
- Service-level images / media library (V1).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Admin can complete the full create-edit-disable cycle in PayloadCMS without leaving the admin app.
- [ ] Disabled Service disappears from `book.<merchant>.com` within 60s.
- [ ] Manual smoke test on Little Biceps' actual service catalog (Renata França drainage, Gua Sha, etc.) configured end-to-end before pilot launch.
