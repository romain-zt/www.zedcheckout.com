import { pgTable, uuid, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { services } from './services';
import { resources } from './resources';
import { rooms } from './rooms';
import { customers } from './customers';
import { policies } from './policies';

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', 'confirmed', 'cancelled', 'completed', 'no_show',
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  resourceId: uuid('resource_id').references(() => resources.id),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
  paymentId: uuid('payment_id').notNull(),
  policyId: uuid('policy_id').notNull().references(() => policies.id),
  rescheduleCount: integer('reschedule_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
