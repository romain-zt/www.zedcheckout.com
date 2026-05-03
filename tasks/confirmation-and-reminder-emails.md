# [TASK] Confirmation and reminder emails

## Link
- **Spec:** `specs/confirmation-and-reminder-emails.md`
- **Branch:** `cursor/zedslot-v0-specs-and-mvp-2a72`

## Scope Classification
2. Project Primitive

## Subtasks

- [ ] T4.1 — Define `ScheduledEmail` entity in `packages/domain` (S)
- [ ] T4.2 — Create `scheduled_emails` Drizzle schema in `packages/database` (S)
- [ ] T4.3 — Implement `EmailSender` interface + Resend wrapper + test double in `packages/email` (M)
- [ ] T4.4 — Implement `BookingConfirmationEmail` React Email template (FR + EN) (M)
- [ ] T4.5 — Implement `generateICS`, calendar URL helpers in `packages/booking-engine` (S)
- [ ] T4.6 — Implement email scheduling: queue on confirm, queue reminder, delete on cancel (S)
- [ ] T4.7 — Implement email cron job: process pending, retry, alert on failure (S)

## Dependencies
- T4.1 → no deps
- T4.2 → depends on T4.1, T1.5
- T4.3 → no domain deps (standalone wrapper)
- T4.4 → depends on T4.3
- T4.5 → depends on T1.1 (Booking entity)
- T4.6 → depends on T4.2, T1.8 (booking confirm flow)
- T4.7 → depends on T4.2, T4.3

## Definition of Done

- [ ] All subtasks complete
- [ ] Spec requirements met
- [ ] Email templates render in FR + EN
- [ ] Calendar links generate valid ICS
- [ ] Integration test: confirm → queue → send (test double)
- [ ] No Resend imports outside packages/email

## Notes
