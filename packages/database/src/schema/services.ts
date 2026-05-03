import { pgTable, uuid, text, integer, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { resources } from './resources.js';
import { rooms } from './rooms.js';

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  nameFr: text('name_fr').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionFr: text('description_fr'),
  descriptionEn: text('description_en'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceCents: integer('price_cents').notNull(),
  requiresResource: boolean('requires_resource').notNull().default(true),
  requiresRoom: boolean('requires_room').notNull().default(true),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const serviceResources = pgTable('service_resources', {
  serviceId: uuid('service_id').notNull().references(() => services.id),
  resourceId: uuid('resource_id').notNull().references(() => resources.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.serviceId, t.resourceId] }),
}));

export const serviceRooms = pgTable('service_rooms', {
  serviceId: uuid('service_id').notNull().references(() => services.id),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.serviceId, t.roomId] }),
}));
