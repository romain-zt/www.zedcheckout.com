import type { CollectionConfig } from 'payload'
import { tenantScopedAccess, injectTenantId, defaultTenantId } from '../hooks/tenant-scoping.js'

export const Resources: CollectionConfig = {
  slug: 'resources',
  dbName: 'resources',
  admin: {
    useAsTitle: 'name',
    group: 'Booking',
    defaultColumns: ['name', 'email', 'status'],
    description: 'Practitioners who deliver services.',
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
      name: 'email',
      type: 'email',
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
  ],
}
