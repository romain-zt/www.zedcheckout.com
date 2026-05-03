import type { CollectionConfig } from 'payload'
import { tenantScopedAccess } from '../hooks/tenant-scoping'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  dbName: 'audit_logs',
  admin: {
    group: 'Operations',
    defaultColumns: ['entity_type', 'entity_id', 'action', 'actor', 'created_at'],
    description: 'Read-only log of all admin actions on bookings, payments, and credits.',
  },
  access: {
    read: tenantScopedAccess,
    create: () => false,
    update: () => false,
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
      name: 'entity_type',
      label: 'Entity type',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'entity_id',
      label: 'Entity ID',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'action',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'actor',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'before',
      type: 'json',
      admin: { readOnly: true },
    },
    {
      name: 'after',
      type: 'json',
      admin: { readOnly: true },
    },
    {
      name: 'reason',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'created_at',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
