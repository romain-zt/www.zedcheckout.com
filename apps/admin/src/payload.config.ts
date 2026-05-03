import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import * as schema from '@zedslot/database/schema'

import { Users } from './collections/Users.js'
import { Services } from './collections/Services.js'
import { Resources } from './collections/Resources.js'
import { Rooms } from './collections/Rooms.js'
import { AvailabilityRules } from './collections/AvailabilityRules.js'
import { Policies } from './collections/Policies.js'
import { Bookings } from './collections/Bookings.js'
import { Customers } from './collections/Customers.js'
import { AuditLogs } from './collections/AuditLogs.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Drizzle version in @zedslot/database (0.38.x) differs from
// @payloadcms/db-postgres (0.45.x). Tables are runtime-compatible;
// the cast is safe. Will resolve when database package upgrades.
const existingTables = {
  tenants: schema.tenants,
  services: schema.services,
  service_resources: schema.serviceResources,
  service_rooms: schema.serviceRooms,
  resources: schema.resources,
  rooms: schema.rooms,
  availability_rules: schema.availabilityRules,
  bookings: schema.bookings,
  customers: schema.customers,
  payments: schema.payments,
  refunds: schema.refunds,
  policies: schema.policies,
  pack_holds: schema.packHolds,
  scheduled_emails: schema.scheduledEmails,
  audit_logs: schema.auditLogs,
} as Record<string, unknown>

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Services,
    Resources,
    Rooms,
    AvailabilityRules,
    Policies,
    Bookings,
    Customers,
    AuditLogs,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false,
    // Register existing Drizzle tables so Payload doesn't try to drop them.
    // See: https://payloadcms.com/docs/database/postgres#beforeSchemaInit
    beforeSchemaInit: [
      ({ schema: payloadSchema }) => {
        return {
          ...payloadSchema,
          tables: {
            ...payloadSchema.tables,
            ...(existingTables as typeof payloadSchema.tables),
          },
        }
      },
    ],
  }),
  sharp,
  plugins: [],
})
