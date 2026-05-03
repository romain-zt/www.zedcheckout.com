import type { CollectionConfig } from 'payload'
import { tenantScopedAccess, injectTenantId, defaultTenantId } from '../hooks/tenant-scoping'

export const AvailabilityRules: CollectionConfig = {
  slug: 'availability-rules',
  dbName: 'availability_rules',
  admin: {
    group: 'Booking',
    defaultColumns: ['scope', 'kind', 'day_of_week', 'start_time', 'end_time'],
    description: 'Recurring schedules and one-off overrides for resources and rooms.',
  },
  access: {
    read: tenantScopedAccess,
    create: () => true,
    update: () => true,
    delete: () => true,
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
      admin: {
        description: 'Format: resource:<uuid> or room:<uuid>',
      },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Recurring', value: 'recurring' },
        { label: 'Override', value: 'override' },
      ],
    },
    {
      name: 'day_of_week',
      label: 'Day of week',
      type: 'select',
      admin: {
        description: 'Required for recurring rules. 0=Sunday, 6=Saturday.',
        condition: (data) => data?.kind === 'recurring',
      },
      options: [
        { label: 'Sunday', value: '0' },
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
      ],
    },
    {
      name: 'start_time',
      label: 'Start time',
      type: 'text',
      required: true,
      admin: { description: 'HH:mm format in tenant timezone' },
    },
    {
      name: 'end_time',
      label: 'End time',
      type: 'text',
      required: true,
      admin: { description: 'HH:mm format in tenant timezone' },
    },
    {
      name: 'date_range_start',
      label: 'Date range start',
      type: 'date',
      admin: {
        description: 'Required for override rules.',
        condition: (data) => data?.kind === 'override',
      },
    },
    {
      name: 'date_range_end',
      label: 'Date range end',
      type: 'date',
      admin: {
        description: 'Required for override rules.',
        condition: (data) => data?.kind === 'override',
      },
    },
    {
      name: 'is_unavailable',
      label: 'Blocks availability (vacation / closed)',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'created_at',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
