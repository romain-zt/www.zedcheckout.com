import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

export const paymentStatusEnum = pgEnum('payment_status', [
  'requires_action', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded',
]);

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  bookingId: uuid('booking_id').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  paidByCardCents: integer('paid_by_card_cents').notNull().default(0),
  paidByPackCents: integer('paid_by_pack_cents').notNull().default(0),
  paidByGiftCardCents: integer('paid_by_gift_card_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull(),
  currency: text('currency').notNull().default('eur'),
  status: paymentStatusEnum('status').notNull().default('requires_action'),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
