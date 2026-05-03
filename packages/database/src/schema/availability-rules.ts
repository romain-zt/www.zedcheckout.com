import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const availabilityRules = pgTable('availability_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  scope: text('scope').notNull(),
  kind: text('kind', { enum: ['recurring', 'override'] }).notNull(),
  dayOfWeek: integer('day_of_week'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  dateRangeStart: timestamp('date_range_start', { withTimezone: true }),
  dateRangeEnd: timestamp('date_range_end', { withTimezone: true }),
  isUnavailable: boolean('is_unavailable').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
