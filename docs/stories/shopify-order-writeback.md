# [STORY] Shopify order writeback

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P1
- **Created:** 2026-05-03

## User Statement

> As the system, when a Booking is confirmed in zedslot, an Order + Customer record is written back to Shopify so the merchant's downstream stack (loyalty, accounting, exports) keeps working.

## Acceptance Criteria

- [ ] On `Booking.status = 'confirmed'`, an order writeback is queued.
- [ ] Worker picks up the queue item and calls Shopify Admin API `orderCreate` mutation with: customer (by email; create if missing), line item (one item per booking, name = service name, quantity = 1, price = total paid), payment status = `paid`, tags including `zedslot:booking:<id>` for traceability, source identifier = `zedslot`.
- [ ] If customer doesn't exist in Shopify, create them with email + name + (optional) phone before the order.
- [ ] Idempotency: replays of the same booking writeback never create a second Shopify order (idempotency key = `Booking.id`; check via tag query before creating).
- [ ] Failures are retried with exponential backoff (1s, 4s, 16s, 1m, 5m, 30m) up to N attempts; persistent failures raise a Sentry alert.
- [ ] Booking remains `confirmed` regardless of Shopify writeback success — Shopify is a downstream sink, not a precondition.
- [ ] Cancellation of a Booking after writeback triggers Shopify order cancel + refund (separate queue item; same idempotency + retry semantics).
- [ ] If the order writeback queue depth exceeds threshold (e.g., 50 items), Sentry alerts admin.
- [ ] Manual "retry writeback" button in admin Booking detail view for stuck items.

## Specs

- [ ] `specs/shopify-order-writeback-worker.md` — queue, worker, retry policy, idempotency
- [ ] `specs/shopify-customer-upsert.md` — find-or-create logic by email
- [ ] `specs/shopify-order-cancel-on-cancellation.md` — cancellation propagation
- [ ] `specs/writeback-monitoring.md` — queue depth, failure rate, alert thresholds

## Out of Scope (for this Story)

- Two-way sync (Shopify → zedslot) — V1+.
- Shopify product mirroring (services as Shopify products) — V0 may still keep services as Shopify products via the existing manual catalog; auto-creation deferred.
- Inventory / stock adjustments.
- Multi-currency conversions (single-currency in pilot).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Writeback success rate ≥ 99.5% within 5 min of confirmation.
- [ ] Idempotency verified: 10 simulated retries of the same booking → 1 Shopify order, 0 duplicates.
- [ ] Forced Shopify outage test: bookings continue to succeed in zedslot; writebacks accumulate in queue; queue drains correctly when API recovers.
