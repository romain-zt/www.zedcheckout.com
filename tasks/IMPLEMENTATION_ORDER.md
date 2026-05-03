# Implementation Order — zedslot V0

## Critical Path (sequential, must be done in order)

```
Phase 1: Domain + Engine (pure TS, zero deps)
├── T1.1 + T1.2: Domain entities (Booking, Payment, Customer, Service, Resource, Room, Tenant, Slot)
├── T8.1: Policy entity + CancellationOutcome types
├── T2.1: PackHold + SplitPaymentBreakdown
├── T4.1: ScheduledEmail entity
├── T9c.1: Refund + RefundAllocation
├── T9.1: AuditLog entity
│
├── T6.3: getAvailableWindows (availability composition)
├── T1.3: listAvailableSlots (depends on getAvailableWindows)
├── T1.4: canBook (conflict pre-check)
├── T7.3: assignRoom
├── T8.3: applyPolicy, canReschedule, formatPolicyText
├── T2.2: calculateSplitPayment
├── T9c.3: splitRefund
├── T4.5: generateICS, calendar URLs
│
Phase 2: Database (Drizzle schema + migrations)
├── T1.5: All tables (tenants, services, resources, rooms, availability_rules, bookings, payments, customers, service_resources, service_rooms)
├── T2.3: pack_holds table
├── T4.2: scheduled_emails table
├── T9c.2: refunds table
├── T9.2: audit_logs table
├── T8.2: policies table + default seed
├── T3.1 + T3.2 + T3.3: btree_gist + EXCLUDE constraints
│
Phase 3: Wrapper packages (external SDKs behind interfaces)
├── T1.6: packages/payments (createPaymentIntent + test double)
├── T9c.4: packages/payments (createRefund + test double)
├── T4.3: packages/email (EmailSender + Resend + test double)
├── T2.4: packages/auth (magic-link + test double)
├── T2.5: packages/shopify (balance lookup + credit write + test double)
│
Phase 4: API + Integration
├── T1.7: GET /api/services, GET /api/slots
├── T1.8: POST /api/bookings, webhook handler
├── T3.4 + T3.5: BookingConflictError wiring
├── T8.5: Policy snapshot on booking creation
├── T2.6: Two-phase split payment orchestration
├── T4.6 + T4.7: Email scheduling + cron
├── T3.6 + T2.7: Pending expiry + pack hold expiry jobs
├── T9c.5: Cancel/reschedule API routes
├── T9c.6: Cancellation email wiring
│
Phase 5: Admin (PayloadCMS) — DEFERRED from MVP slice
├── T5.3 + T5.4 + T5.5: Services collection
├── T6.4 + T6.5: Resources + AvailabilityRules collections
├── T7.4: Rooms collection
├── T8.4: Policies collection
├── T9.3 + T9.4 + T9.5 + T9.6: Bookings view + overrides + refunds
│
Phase 6: Email templates — DEFERRED from MVP slice
├── T4.4: BookingConfirmationEmail template (FR + EN)
```

## Parallel Opportunities

These groups can run concurrently within each phase:

### Phase 1 parallelism
- All entity definitions (T1.1, T1.2, T8.1, T2.1, T4.1, T9c.1, T9.1) → all independent
- Engine functions after entities: T6.3 ∥ T1.4 ∥ T7.3 ∥ T8.3 ∥ T2.2 ∥ T9c.3 ∥ T4.5 (only T1.3 depends on T6.3)

### Phase 2 parallelism
- All table schemas are independent (just need entities defined first)
- EXCLUDE constraints must come after bookings table

### Phase 3 parallelism
- All wrapper packages are independent of each other
- packages/payments ∥ packages/email ∥ packages/auth ∥ packages/shopify

### Phase 4 parallelism
- API routes depend on DB + wrappers but are independent of each other:
  - Booking flow (T1.7, T1.8) ∥ Email scheduling (T4.6, T4.7) ∥ Expiry jobs (T3.6, T2.7)
  - Cancel/reschedule (T9c.5) depends on booking flow being done

## MVP Slice (this PR)

The smallest valuable end-to-end slice:

**Stories covered:** book-as-guest-card + redeem-pack-credit + no-double-booking-guarantee + confirmation-emails

**Implementation scope:**
1. `packages/domain` — all entities and value objects
2. `packages/booking-engine` — all pure functions + property tests
3. `packages/database` — Drizzle schema (all tables) + EXCLUDE constraints
4. `packages/payments` — createPaymentIntent + createRefund + test doubles
5. `packages/email` — EmailSender interface + test double (templates deferred)
6. `packages/auth` — magic-link interface + test double
7. `packages/shopify` — balance + credit interfaces + test doubles
8. `apps/booking` — API routes for booking flow (minimal, no UI in this slice)

**Explicitly deferred from this slice:**
- PayloadCMS admin collections (Phase 5)
- React Email templates (Phase 6)
- Booking UI components (separate PR)
- Shopify order writeback (P1)
- A/B testing harness (P1)
