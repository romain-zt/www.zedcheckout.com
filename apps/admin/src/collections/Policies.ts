import type { CollectionConfig } from 'payload'
import { tenantScopedAccess, injectTenantId, defaultTenantId } from '../hooks/tenant-scoping'

export const Policies: CollectionConfig = {
  slug: 'policies',
  dbName: 'policies',
  admin: {
    group: 'Configuration',
    defaultColumns: ['scope', 'free_cancel_hours', 'late_cancel_behavior', 'no_show_behavior'],
    description: 'Cancellation, refund, and reschedule rules. One global policy per tenant in V0.',
  },
  access: {
    read: tenantScopedAccess,
    create: () => true,
    update: () => true,
    delete: () => false,
  },
  hooks: {
    beforeChange: [injectTenantId],
  },
  fields: [
    {
      name: 'tenant_id',
      type: 'text',
      required: true,
      admin: { hidden: true },
      hooks: { beforeChange: [defaultTenantId] },
    },
    {
      name: 'scope',
      type: 'text',
      required: true,
      defaultValue: 'global',
      admin: {
        description: '"global" for tenant-wide policy. "service:<id>" for per-service (V1).',
        readOnly: true,
      },
    },
    {
      name: 'free_cancel_hours',
      label: 'Free cancellation window (hours)',
      type: 'number',
      required: true,
      defaultValue: 24,
      min: 0,
    },
    {
      name: 'late_cancel_behavior',
      label: 'Late cancellation behavior',
      type: 'select',
      required: true,
      defaultValue: 'credit',
      options: [
        { label: 'Credit to pack', value: 'credit' },
        { label: 'No refund', value: 'none' },
      ],
    },
    {
      name: 'no_show_behavior',
      label: 'No-show behavior',
      type: 'select',
      required: true,
      defaultValue: 'charged',
      options: [
        { label: 'Charged (no refund)', value: 'charged' },
        { label: 'Refundable', value: 'refundable' },
        { label: 'Partial refund (50%)', value: 'partial' },
      ],
    },
    {
      name: 'free_reschedule_hours',
      label: 'Free reschedule window (hours)',
      type: 'number',
      required: true,
      defaultValue: 24,
      min: 0,
    },
    {
      name: 'max_reschedules',
      label: 'Max reschedules per booking',
      type: 'number',
      required: true,
      defaultValue: 2,
      min: 0,
    },
  ],
}
