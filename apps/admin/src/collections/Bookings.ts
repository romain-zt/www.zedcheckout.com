import type { CollectionConfig } from 'payload'
import { tenantScopedAccess } from '../hooks/tenant-scoping.js'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  dbName: 'bookings',
  admin: {
    group: 'Operations',
    defaultColumns: ['status', 'service_id', 'resource_id', 'room_id', 'starts_at', 'customer_id'],
    description: 'All bookings. Read-mostly — use status overrides for admin actions.',
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
      name: 'service_id',
      label: 'Service',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'resource_id',
      label: 'Resource',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'room_id',
      label: 'Room',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'customer_id',
      label: 'Customer',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'starts_at',
      label: 'Starts at',
      type: 'date',
      required: true,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'ends_at',
      label: 'Ends at',
      type: 'date',
      required: true,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
        { label: 'No Show', value: 'no_show' },
      ],
    },
    {
      name: 'payment_id',
      label: 'Payment',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'policy_id',
      label: 'Policy snapshot',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'reschedule_count',
      label: 'Reschedule count',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'created_at',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
