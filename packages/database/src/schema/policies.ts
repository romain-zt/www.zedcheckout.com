import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  scope: text('scope').notNull().default('global'),
  freeCancelHours: integer('free_cancel_hours').notNull().default(24),
  lateCancelBehavior: text('late_cancel_behavior', { enum: ['credit', 'none'] }).notNull().default('credit'),
  noShowBehavior: text('no_show_behavior', { enum: ['charged', 'refundable', 'partial'] }).notNull().default('charged'),
  freeRescheduleHours: integer('free_reschedule_hours').notNull().default(24),
  maxReschedules: integer('max_reschedules').notNull().default(2),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
