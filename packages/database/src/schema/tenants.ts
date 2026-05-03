import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  timezone: text('timezone').notNull().default('Europe/Paris'),
  defaultLocale: text('default_locale', { enum: ['fr', 'en'] }).notNull().default('fr'),
  locales: jsonb('locales').$type<string[]>().notNull().default(['fr', 'en']),
  branding: jsonb('branding').$type<{ logoUrl: string | null; primaryColor: string | null }>().notNull().default({ logoUrl: null, primaryColor: null }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
