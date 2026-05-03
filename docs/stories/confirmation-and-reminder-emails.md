# [STORY] Confirmation + reminder emails

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P0
- **Created:** 2026-05-03

## User Statement

> As a customer, I receive a confirmation email immediately after booking and a reminder email at the configured time before my slot, both in my preferred language and on-brand.

## Acceptance Criteria

- [ ] On `Booking.status` transition to `confirmed`, a confirmation email is queued and delivered within 60s (p95).
- [ ] Confirmation email includes: customer name, service, practitioner, room (if surfaced to customers — admin-configurable), date + time in customer's local timezone (with merchant timezone as a sub-label), institute address, contact info, cancellation/reschedule links with one-tap auth tokens, "add to calendar" links (Apple, Google, ICS).
- [ ] Reminder email is queued at `booking.startsAt - notifications_email_reminder_hours` (feature-flag-controlled; default 24h) and delivered within 5 min of scheduled time.
- [ ] Both emails respect `Tenant.defaultLocale` and customer's stored language preference (FR / EN at launch).
- [ ] Emails carry merchant branding (logo, primary color from `Tenant.branding`).
- [ ] Email delivery failures are retried (Resend handles retries); persistent failures (3+ attempts) raise a Sentry alert.
- [ ] Cancellation triggers a cancellation email with refund details (amount, destination, expected timing).

## Specs

- [ ] `specs/transactional-email-templates.md` — React Email templates for confirmation, reminder, cancellation, refund-issued
- [ ] `specs/email-scheduling-job.md` — cron / queue strategy for reminders (Vercel Cron + queue table, or BullMQ on Upstash)
- [ ] `specs/calendar-attachment-generation.md` — ICS generation, Apple / Google calendar URLs

## Out of Scope (for this Story)

- SMS / WhatsApp notifications (V0.1).
- Marketing / drip emails.
- Practitioner-side notifications (V1 with practitioner login).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Confirmation email delivery rate ≥ 99% (p95 latency < 60s post-confirmation).
- [ ] Reminder email delivery rate ≥ 99% (p95 latency < 5min from scheduled time).
- [ ] Email rendering verified on Apple Mail (iOS + macOS), Gmail (web + Android), Outlook (web).
- [ ] Templates rendered in both FR and EN.
- [ ] Bounce/spam complaint rate < 0.5% (Resend metric).
