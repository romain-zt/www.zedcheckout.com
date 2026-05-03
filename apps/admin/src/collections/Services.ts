import type { CollectionConfig } from 'payload'
import { tenantScopedAccess, injectTenantId, defaultTenantId } from '../hooks/tenant-scoping'

export const Services: CollectionConfig = {
  slug: 'services',
  dbName: 'services',
  admin: {
    useAsTitle: 'name_fr',
    group: 'Booking',
    defaultColumns: ['name_fr', 'duration_minutes', 'price_cents', 'status'],
    description: 'Bookable services offered by the tenant.',
  },
  access: {
    read: tenantScopedAccess,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [injectTenantId],
    beforeDelete: [
      async ({ req, id }) => {
        const bookings = await req.payload.find({
          collection: 'bookings',
          where: {
            service_id: { equals: id },
            status: { in: ['confirmed', 'pending'] },
          },
          limit: 1,
        })
        if (bookings.totalDocs > 0) {
          throw new Error(
            'Cannot delete a service with confirmed or pending bookings. Disable it instead.',
          )
        }
      },
    ],
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
      name: 'name_fr',
      label: 'Name (FR)',
      type: 'text',
      required: true,
    },
    {
      name: 'name_en',
      label: 'Name (EN)',
      type: 'text',
      required: true,
    },
    {
      name: 'description_fr',
      label: 'Description (FR)',
      type: 'textarea',
    },
    {
      name: 'description_en',
      label: 'Description (EN)',
      type: 'textarea',
    },
    {
      name: 'duration_minutes',
      label: 'Duration (minutes)',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'price_cents',
      label: 'Price (cents)',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'requires_resource',
      label: 'Requires a practitioner',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'requires_room',
      label: 'Requires a room',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
      ],
    },
    {
      name: 'created_at',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updated_at',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
