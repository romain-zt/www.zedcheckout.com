# [TASK] Redeem pack credit at booking checkout

## Link
- **Spec:** `specs/redeem-pack-credit.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T2.1 — Define `PackHold`, `SplitPaymentBreakdown` in `packages/domain` (S)
- [ ] T2.2 — Implement `calculateSplitPayment` in `packages/booking-engine` with property tests (S)
- [ ] T2.3 — Create `pack_holds` Drizzle schema in `packages/database` (S)
- [ ] T2.4 — Implement magic-link auth in `packages/auth`: issue, verify, session + test double (M)
- [ ] T2.5 — Implement Shopify balance wrappers in `packages/shopify`: getCustomerByEmail, getCustomerCredit, setCustomerCredit + test double (M)
- [ ] T2.6 — Implement two-phase orchestration: reserve → charge → debit/release in API layer (M)
- [ ] T2.7 — Implement pack hold expiry background job (S)

## Dependencies
- T2.1 → depends on T1.1 (Booking, Payment entities)
- T2.2 → depends on T2.1
- T2.3 → depends on T2.1, T1.5 (DB schema)
- T2.4 → no domain deps (standalone wrapper)
- T2.5 → no domain deps (standalone wrapper)
- T2.6 → depends on T2.2, T2.3, T2.4, T2.5, T1.6 (payments)
- T2.7 → depends on T2.3

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met
- [ ] Linter clean
- [ ] Tests pass
- [ ] Property test: calculateSplitPayment conserves total
- [ ] Idempotency: replay never double-debits
- [ ] No Shopify imports outside packages/shopify

## Notes
