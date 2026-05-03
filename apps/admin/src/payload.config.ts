import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import * as schema from '@zedslot/database/schema'

import { Users } from './collections/Users'
import { Services } from './collections/Services'
import { Resources } from './collections/Resources'
import { Rooms } from './collections/Rooms'
import { AvailabilityRules } from './collections/AvailabilityRules'
import { Policies } from './collections/Policies'
import { Bookings } from './collections/Bookings'
import { Customers } from './collections/Customers'
import { AuditLogs } from './collections/AuditLogs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Drizzle version in @zedslot/database (0.38.x) differs from
// @payloadcms/db-postgres (0.45.x). Tables are runtime-compatible;
// the cast is safe. Will resolve when database package upgrades.
// Only register Drizzle-managed tables that have NO corresponding Payload
// collection. Tables with a Payload collection are managed by Payload's DDL.
const drizzleOnlyTables = {
  tenants: schema.tenants,
  service_resources: schema.serviceResources,
  service_rooms: schema.serviceRooms,
  payments: schema.payments,
  refunds: schema.refunds,
  pack_holds: schema.packHolds,
  scheduled_emails: schema.scheduledEmails,
} as Record<string, unknown>

const drizzleOnlyEnums = {
  payment_status: schema.paymentStatusEnum,
  pack_hold_status: schema.packHoldStatusEnum,
  email_type: schema.emailTypeEnum,
  email_status: schema.emailStatusEnum,
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
    idType: 'uuid',
    push: false,
    // Register existing Drizzle tables so Payload doesn't try to drop them.
    // See: https://payloadcms.com/docs/database/postgres#beforeSchemaInit
    beforeSchemaInit: [
      ({ schema: payloadSchema }) => {
        return {
          ...payloadSchema,
          tables: {
            ...payloadSchema.tables,
            ...(drizzleOnlyTables as typeof payloadSchema.tables),
          },
          enums: {
            ...payloadSchema.enums,
            ...(drizzleOnlyEnums as typeof payloadSchema.enums),
          },
        }
      },
    ],
  }),
  sharp,
  plugins: [],
})
