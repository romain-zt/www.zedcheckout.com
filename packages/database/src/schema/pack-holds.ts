import { pgTable, uuid, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { customers } from './customers';
import { bookings } from './bookings';

export const packHoldStatusEnum = pgEnum('pack_hold_status', ['held', 'debited', 'released']);

export const packHolds = pgTable('pack_holds', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  amountCents: integer('amount_cents').notNull(),
  status: packHoldStatusEnum('status').notNull().default('held'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
