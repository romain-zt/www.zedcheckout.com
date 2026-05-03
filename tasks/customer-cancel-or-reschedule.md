# [TASK] Customer cancels or reschedules

## Link
- **Spec:** `specs/customer-cancel-or-reschedule.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T9c.1 — Define `Refund`, `RefundAllocation` in `packages/domain` (S)
- [ ] T9c.2 — Create refunds Drizzle schema (S)
- [ ] T9c.3 — Implement `splitRefund` in `packages/booking-engine` with property tests (M)
- [ ] T9c.4 — Implement `createRefund` in `packages/payments` + test double (S)
- [ ] T9c.5 — Implement manage/cancel/reschedule API routes (M)
- [ ] T9c.6 — Wire cancellation email on cancel (S)

## Dependencies
- T9c.1 → depends on T1.1
- T9c.2 → depends on T9c.1, T1.5
- T9c.3 → depends on T9c.1
- T9c.4 → depends on T9c.1
- T9c.5 → depends on T9c.2, T9c.3, T9c.4, T8.3
- T9c.6 → depends on T9c.5, T4.3

## Definition of Done

- [ ] All subtasks complete
- [ ] Property test: splitRefund conserves total exactly
- [ ] Refund-to-source: card→Stripe, pack→Shopify
- [ ] Reschedule atomic
- [ ] No float math

## Notes
