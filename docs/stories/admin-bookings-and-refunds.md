# [STORY] Admin sees bookings, overrides status, triggers manual refunds

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As an admin, I can see all bookings in PayloadCMS — filtered by date, resource, room, status — manually override a booking's status (mark no-show, completed, cancelled), and trigger a manual refund (full or partial, with policy override).

## Acceptance Criteria

- [ ] PayloadCMS Bookings collection (read-mostly) shows: customer, service, practitioner, room, start time, status, paid amount + breakdown (card / pack / gift card), policy applied.
- [ ] List view supports filters: date range, resource, room, status, customer email.
- [ ] Calendar view (custom Payload block) shows bookings on a weekly/daily grid filterable by resource and room.
- [ ] Booking detail view supports actions:
  - Mark as `completed` (irreversible).
  - Mark as `no_show` (triggers `noShowBehavior` from policy automatically; admin can override the financial outcome).
  - Cancel with refund (admin can override policy and choose: refund-to-source, refund-as-credit, or no refund — with required reason field).
  - Issue partial refund (admin enters amount; allocation respects refund-to-source rule by default but admin can force allocation).
- [ ] Every override is recorded in an audit log with actor, timestamp, before/after values, and reason.
- [ ] Refund actions trigger the same refund-to-source engine used by customer-initiated cancellations.
- [ ] Admin can view per-customer history (all bookings, all payments, all refunds, current pack credit + gift card balance).
- [ ] Admin can manually adjust pack credit on a customer (e.g., "+€50 goodwill credit") with required reason → adjustment writes to Shopify metafield via the same idempotent path used at booking time.

## Specs

- [ ] `specs/admin-bookings-view.md` — list + detail + calendar Payload blocks
- [ ] `specs/manual-refund-flow.md` — admin UI for partial refunds, override reasons, audit trail
- [ ] `specs/admin-customer-view.md` — read view of customer history + pack-credit adjustment UI
- [ ] `specs/audit-log.md` — schema and surfacing of override audit trail

## Out of Scope (for this Story)

- Admin-initiated booking creation (V1 — admin currently creates bookings only via the customer-facing flow).
- Bulk operations.
- Reporting / dashboards (V1).
- Practitioner role with limited admin access (V1).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Admin can complete a manual refund within 60s of starting it (UI responsiveness target).
- [ ] Pack-credit adjustment writes to Shopify within 60s in 99% of cases.
- [ ] Audit log entries verified for every override action in manual smoke test.
- [ ] Little Biceps admin staff trained on the UI in dogfood week.
