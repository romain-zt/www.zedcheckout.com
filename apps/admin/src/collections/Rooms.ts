import type { CollectionConfig } from 'payload'
import { tenantScopedAccess, injectTenantId, defaultTenantId } from '../hooks/tenant-scoping'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  dbName: 'rooms',
  admin: {
    useAsTitle: 'name',
    group: 'Booking',
    defaultColumns: ['name', 'bookable_without_resource', 'status'],
    description: 'Physical rooms where services are delivered.',
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'bookable_without_resource',
      label: 'Bookable without a practitioner',
      type: 'checkbox',
      defaultValue: false,
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
  ],
}
