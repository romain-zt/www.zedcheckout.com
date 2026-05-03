import { pgTable, uuid, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  shopifyCustomerId: text('shopify_customer_id'),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  phone: text('phone'),
  packCreditCents: integer('pack_credit_cents').notNull().default(0),
  giftCardBalanceCents: integer('gift_card_balance_cents').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  tenantEmail: uniqueIndex('customers_tenant_email_idx').on(t.tenantId, t.email),
}));
