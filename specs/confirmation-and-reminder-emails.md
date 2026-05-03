# [SPEC] Confirmation and reminder emails

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/confirmation-and-reminder-emails.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

After booking, customers need immediate confirmation with all details (service, practitioner, time, address, calendar links) and a timely reminder before their slot. Cancellation events also need email notification with refund details. All emails must be bilingual (FR/EN) and on-brand.

## Solution

React Email templates in `packages/email`, sent via the Resend wrapper. Confirmation email queued on booking `confirmed` event. Reminder email scheduled via a `scheduled_emails` table + cron job. Cancellation email on booking `cancelled` event.

## Scope

### In Scope
- Confirmation email template (React Email)
- Reminder email template (React Email)
- Cancellation/refund email template (React Email)
- Email scheduling (DB-backed queue + cron)
- ICS calendar attachment generation
- Apple Calendar / Google Calendar URLs
- i18n (FR/EN) with tenant locale + customer preference
- Merchant branding (logo, colors from `Tenant.branding`)
- "Manage booking" link with signed one-tap auth token
- Delivery failure alerting (Sentry on 3+ failures)

### Out of Scope
- SMS / WhatsApp notifications (V0.1)
- Marketing / drip emails
- Practitioner-side notifications (V1)
- Email open tracking / analytics
- Custom email templates per service

## Technical Design

### Data Models

```ts
// packages/domain/src/entities/scheduled-email.ts
type EmailType = 'booking_confirmation' | 'booking_reminder' | 'booking_cancellation';
type EmailStatus = 'pending' | 'sent' | 'failed';

interface ScheduledEmail {
  id: string;
  tenantId: string;
  bookingId: string;
  type: EmailType;
  scheduledAt: Date;    // when to send
  status: EmailStatus;
  attempts: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
}
```

### DB Tables (Drizzle)

```ts
export const emailTypeEnum = pgEnum('email_type', [
  'booking_confirmation', 'booking_reminder', 'booking_cancellation'
]);

export const emailStatusEnum = pgEnum('email_status', ['pending', 'sent', 'failed']);

export const scheduledEmails = pgTable('scheduled_emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  type: emailTypeEnum('type').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  status: emailStatusEnum('status').notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### API / Interfaces

#### Email wrapper (`packages/email`)

```ts
// packages/email/src/index.ts
interface EmailSender {
  send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ id: string; success: boolean }>;
}

// packages/email/src/templates/booking-confirmation.tsx
function BookingConfirmationEmail(props: {
  customerName: string;
  serviceName: string;
  practitionerName: string | null;
  roomName: string | null;
  dateTime: string;       // formatted in customer locale + tz
  merchantTimezone: string;
  address: string;
  contactInfo: string;
  manageBookingUrl: string;
  calendarLinks: { apple: string; google: string; ics: string };
  policyText: string;
  locale: 'fr' | 'en';
  branding: { logoUrl: string; primaryColor: string };
}): React.ReactElement;

// Similar for BookingReminderEmail, BookingCancellationEmail
```

#### Calendar attachment (`packages/booking-engine`)

```ts
// packages/booking-engine/src/calendar.ts (pure function, no deps)
function generateICS(booking: {
  id: string;
  serviceName: string;
  practitionerName: string | null;
  startsAt: Date;
  endsAt: Date;
  location: string;
  description: string;
}): string;  // ICS file content

function generateGoogleCalendarUrl(booking: { ... }): string;
function generateAppleCalendarUrl(booking: { ... }): string;
```

#### Email scheduling

On booking confirmed:
1. Insert `scheduled_emails` row with `type='booking_confirmation'`, `scheduledAt=now`
2. Insert `scheduled_emails` row with `type='booking_reminder'`, `scheduledAt=booking.startsAt - reminderHours`

On booking cancelled:
1. Insert `scheduled_emails` row with `type='booking_cancellation'`, `scheduledAt=now`
2. Delete any pending `booking_reminder` row for this booking

#### Cron job (runs every 1 minute)

```ts
async function processScheduledEmails(db, emailSender, now: Date): Promise<void> {
  // 1. SELECT * FROM scheduled_emails WHERE status='pending' AND scheduledAt <= now LIMIT 50 FOR UPDATE SKIP LOCKED
  // 2. For each: render template, send via emailSender, update status
  // 3. On send failure: increment attempts; if attempts >= 3 → status='failed' + Sentry alert
}
```

### "Manage Booking" Auth Token

One-tap signed link embedded in emails:
```ts
// Token payload
{ bookingId: string; customerId: string; exp: number /* 7 days */ }
// Signed with HMAC-SHA256, tenant-scoped secret
// Single-use: on first use, sets session cookie and invalidates token
```

### Dependencies
- `packages/domain` — `ScheduledEmail` entity, email types
- `packages/booking-engine` — `generateICS`, `generateGoogleCalendarUrl`, `generateAppleCalendarUrl`
- `packages/email` — `EmailSender` interface, React Email templates, Resend wrapper
- `packages/email/__test-double` — in-memory email sender for tests
- `packages/database` — `scheduled_emails` table
- `packages/feature-flags` — `notifications_email_reminder_hours` flag

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Queue confirmation email | `(bookingId, type='booking_confirmation')` | UNIQUE constraint prevents duplicates |
| Queue reminder email | `(bookingId, type='booking_reminder')` | UNIQUE constraint prevents duplicates |
| Send email | `scheduledEmail.id` | Status check: skip if already 'sent' |
| Cancel reminder on booking cancel | `(bookingId, type='booking_reminder')` | Delete or mark cancelled; no-op if already sent |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Booking confirmed but email sending fails | Retry up to 3 times; alert on persistent failure |
| Booking cancelled before reminder sent | Pending reminder deleted; cancellation email queued |
| Reminder scheduled for past (booking in < reminderHours) | Send immediately; don't skip |
| Email service (Resend) down | Emails stay `pending`; cron retries on next run; alert after 3 failures |
| Customer email bounces | Resend handles bounce; Sentry alert on hard bounce |
| Booking rescheduled | Old reminder deleted; new reminder + new confirmation queued |
| Manage-booking token used twice | First use sets session; second use shows "already used" |
| Manage-booking token expired (>7 days) | "Link expired" page; re-send option with magic link |
| Locale not set on customer | Fall back to `Tenant.defaultLocale` |

## Definition of Done

- [ ] `packages/domain`: `ScheduledEmail` entity typed
- [ ] `packages/email`: `EmailSender` interface + Resend implementation + test double
- [ ] `packages/email`: `BookingConfirmationEmail` template (FR + EN)
- [ ] `packages/email`: `BookingReminderEmail` template (FR + EN)
- [ ] `packages/email`: `BookingCancellationEmail` template (FR + EN)
- [ ] `packages/booking-engine`: `generateICS`, `generateGoogleCalendarUrl`, `generateAppleCalendarUrl` with unit tests
- [ ] `packages/database`: `scheduled_emails` table + migration
- [ ] Email scheduling: confirmation queued on booking confirm, reminder queued at T-reminderHours
- [ ] Cron job: processes pending emails, retries on failure, alerts on 3+ failures
- [ ] Manage-booking auth token: signed, single-use, 7-day expiry
- [ ] Integration test: booking confirm → email queued → cron sends → test double received
- [ ] No Resend imports outside `packages/email`

## Open Questions

- [x] Reminder default hours: 24h (confirmed by feature flag inventory in architecture doc)
- [x] Email from address: configurable per tenant in `Tenant.branding` (V0 uses Resend default domain)
