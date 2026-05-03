import { pgTable, uuid, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { bookings } from './bookings.js';

export const emailTypeEnum = pgEnum('email_type', [
  'booking_confirmation', 'booking_reminder', 'booking_cancellation',
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
