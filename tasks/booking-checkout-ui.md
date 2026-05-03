# [TASK] Booking Checkout UI

## Link
- **Spec:** `specs/booking-checkout-ui.md`
- **Branch:** `cursor/booking-checkout-ui-cca2`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] 1. Create `packages/ui` — Card, Button, Input, Skeleton, Badge, ScrollArea, Spinner (CVA variants, Tailwind)
- [ ] 2. Extend services API to include `eligibleResourceIds` + create resources API route
- [ ] 3. Create booking status API route (`GET /api/bookings/[id]`)
- [ ] 4. Create `apps/booking` layout.tsx with Tailwind, globals, fonts
- [ ] 5. Create BookingFlow client component (state machine + data fetching)
- [ ] 6. Create ServicePicker component
- [ ] 7. Create PractitionerPicker component
- [ ] 8. Create SlotPicker component (day tabs + time slots)
- [ ] 9. Create CustomerForm component
- [ ] 10. Create PackCreditSection component (magic-link auth + balance)
- [ ] 11. Create PaymentSection component (Stripe Payment Element)
- [ ] 12. Create ConfirmationScreen component (details + calendar links)
- [ ] 13. Create BookingStatusPoller component
- [ ] 14. Wire analytics events at each funnel step
- [ ] 15. Verify TypeScript strict + mobile-first responsiveness

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met
- [ ] TypeScript clean (`0 errors`)
- [ ] Mobile-first verified at 320px
- [ ] No hardcoded client values
- [ ] PR opened with spec link in description

## Notes

Dependencies: 1 → 4–14 (UI package needed first). 2–3 → 5–13 (API routes needed for data). 4 → 5 → 6,7,8,9,10,11,12,13 (flow container needed first).
