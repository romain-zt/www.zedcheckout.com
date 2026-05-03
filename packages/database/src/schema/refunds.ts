import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { payments } from './payments.js';
import { bookings } from './bookings.js';

export const refunds = pgTable('refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  paymentId: uuid('payment_id').notNull().references(() => payments.id),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  refundedToCardCents: integer('refunded_to_card_cents').notNull().default(0),
  refundedToPackCents: integer('refunded_to_pack_cents').notNull().default(0),
  refundedToGiftCardCents: integer('refunded_to_gift_card_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
