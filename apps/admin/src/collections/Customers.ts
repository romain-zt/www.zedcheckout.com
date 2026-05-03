import type { CollectionConfig } from 'payload'
import { tenantScopedAccess } from '../hooks/tenant-scoping'

export const Customers: CollectionConfig = {
  slug: 'customers',
  dbName: 'customers',
  admin: {
    useAsTitle: 'display_name',
    group: 'Operations',
    defaultColumns: ['display_name', 'email', 'pack_credit_cents', 'gift_card_balance_cents'],
    description: 'End-user customers with booking history and credit balances.',
  },
  access: {
    read: tenantScopedAccess,
    create: () => false,
    update: () => true,
    delete: () => false,
  },
  fields: [
    {
      name: 'tenant_id',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'shopify_customer_id',
      label: 'Shopify customer ID',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'display_name',
      label: 'Display name',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'phone',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'pack_credit_cents',
      label: 'Pack credit (cents)',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Adjustments here should be accompanied by an audit log entry.',
      },
    },
    {
      name: 'gift_card_balance_cents',
      label: 'Gift card balance (cents)',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'created_at',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
