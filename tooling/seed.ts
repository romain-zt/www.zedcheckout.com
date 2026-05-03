/**
 * Idempotent seed script for Little Biceps V0.
 *
 * Seeds tenants via Drizzle (not a Payload collection) and all other
 * entities via the Payload Local API. Each record uses a fixed UUID so
 * the script can be re-run safely — existing records are skipped.
 *
 * Usage:  pnpm db:seed          (from repo root)
 *    or:  tsx tooling/seed.ts
 */

import { getPayload } from 'payload'
import { eq } from 'drizzle-orm'
import config from '../apps/admin/src/payload.config'

// ---------------------------------------------------------------------------
// Fixed UUIDs
// ---------------------------------------------------------------------------
const TENANT_ID       = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const ADMIN_USER_ID   = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
const RESOURCE_ORIANE = 'c3d4e5f6-a7b8-9012-cdef-123456789012'
const RESOURCE_EMMA   = 'd4e5f6a7-b8c9-0123-def0-234567890123'
const RESOURCE_IRIS   = 'e5f6a7b8-c9d0-1234-ef01-345678901234'
const RESOURCE_STEPH  = 'f6a7b8c9-d0e1-2345-f012-456789012345'
const ROOM_A          = '01a2b3c4-d5e6-7890-0123-567890123456'
const ROOM_B          = '12b3c4d5-e6f7-8901-1234-678901234567'
const SERVICE_DRAIN   = '23c4d5e6-f7a8-9012-2345-789012345678'
const SERVICE_MASSAGE = '34d5e6f7-a8b9-0123-3456-890123456789'
const SERVICE_VISAGE  = '45e6f7a8-b9c0-1234-4567-901234567890'
const POLICY_GLOBAL   = '56f7a8b9-c0d1-2345-5678-012345678901'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type Payload = Awaited<ReturnType<typeof getPayload>>

async function existsInPayload(
  payload: Payload,
  collection: string,
  id: string,
): Promise<boolean> {
  const result = await payload.find({
    collection: collection as any,
    where: { id: { equals: id } },
    limit: 1,
  })
  return result.totalDocs > 0
}

function log(action: 'skip' | 'create', entity: string, label: string) {
  const prefix = action === 'skip' ? '  ⏭  SKIP' : '  ✅ CREATE'
  console.log(`${prefix}  ${entity} — ${label}`)
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedTenant(payload: Payload) {
  console.log('\n— Tenant —')

  // Tenants are a raw Drizzle table, not a Payload collection.
  // Access the Drizzle instance from the Payload DB adapter.
  const db = (payload.db as any).drizzle
  const { tenants } = await import('@zedslot/database/schema')

  const existing = await db.select().from(tenants).where(eq(tenants.id, TENANT_ID))
  if (existing.length > 0) {
    log('skip', 'tenant', 'littlebiceps')
    return
  }

  await db.insert(tenants).values({
    id: TENANT_ID,
    slug: 'littlebiceps',
    displayName: 'Little Biceps',
    timezone: 'Europe/Paris',
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    branding: { logoUrl: null, primaryColor: null },
  })
  log('create', 'tenant', 'littlebiceps')
}

async function seedAdminUser(payload: Payload) {
  console.log('\n— Admin User —')

  if (await existsInPayload(payload, 'users', ADMIN_USER_ID)) {
    log('skip', 'user', 'admin@littlebiceps.com')
    return
  }

  await payload.create({
    collection: 'users',
    data: {
      id: ADMIN_USER_ID,
      email: 'admin@littlebiceps.com',
      password: 'changeme123!',
    } as any,
  })
  log('create', 'user', 'admin@littlebiceps.com')
}

async function seedResources(payload: Payload) {
  console.log('\n— Resources —')

  const resources = [
    { id: RESOURCE_ORIANE, name: 'Oriane' },
    { id: RESOURCE_EMMA,   name: 'Emmanuelle' },
    { id: RESOURCE_IRIS,   name: 'Iris' },
    { id: RESOURCE_STEPH,  name: 'Stéphanie' },
  ]

  for (const r of resources) {
    if (await existsInPayload(payload, 'resources', r.id)) {
      log('skip', 'resource', r.name)
      continue
    }

    await payload.create({
      collection: 'resources',
      data: {
        id: r.id,
        tenant_id: TENANT_ID,
        name: r.name,
        status: 'active',
      } as any,
    })
    log('create', 'resource', r.name)
  }
}

async function seedRooms(payload: Payload) {
  console.log('\n— Rooms —')

  const rooms = [
    { id: ROOM_A, name: 'Salle A' },
    { id: ROOM_B, name: 'Salle B' },
  ]

  for (const r of rooms) {
    if (await existsInPayload(payload, 'rooms', r.id)) {
      log('skip', 'room', r.name)
      continue
    }

    await payload.create({
      collection: 'rooms',
      data: {
        id: r.id,
        tenant_id: TENANT_ID,
        name: r.name,
        bookable_without_resource: false,
        status: 'active',
      } as any,
    })
    log('create', 'room', r.name)
  }
}

async function seedServices(payload: Payload) {
  console.log('\n— Services —')

  const services = [
    {
      id: SERVICE_DRAIN,
      name_fr: 'Drainage Renata França',
      name_en: 'Renata França Lymphatic Drainage',
      duration_minutes: 60,
      price_cents: 12000,
    },
    {
      id: SERVICE_MASSAGE,
      name_fr: 'Massage Deep Tissue',
      name_en: 'Deep Tissue Massage',
      duration_minutes: 90,
      price_cents: 15000,
    },
    {
      id: SERVICE_VISAGE,
      name_fr: 'Soin Visage',
      name_en: 'Facial Treatment',
      duration_minutes: 45,
      price_cents: 9000,
    },
  ]

  for (const s of services) {
    if (await existsInPayload(payload, 'services', s.id)) {
      log('skip', 'service', s.name_fr)
      continue
    }

    await payload.create({
      collection: 'services',
      data: {
        id: s.id,
        tenant_id: TENANT_ID,
        name_fr: s.name_fr,
        name_en: s.name_en,
        duration_minutes: s.duration_minutes,
        price_cents: s.price_cents,
        requires_resource: true,
        requires_room: true,
        status: 'active',
      } as any,
    })
    log('create', 'service', s.name_fr)
  }
}

async function seedPolicy(payload: Payload) {
  console.log('\n— Policy —')

  if (await existsInPayload(payload, 'policies', POLICY_GLOBAL)) {
    log('skip', 'policy', 'global')
    return
  }

  await payload.create({
    collection: 'policies',
    data: {
      id: POLICY_GLOBAL,
      tenant_id: TENANT_ID,
      scope: 'global',
      free_cancel_hours: 24,
      late_cancel_behavior: 'credit',
      no_show_behavior: 'charged',
      free_reschedule_hours: 24,
      max_reschedules: 2,
    } as any,
  })
  log('create', 'policy', 'global')
}

async function seedAvailabilityRules(payload: Payload) {
  console.log('\n— Availability Rules —')

  const resourceIds = [RESOURCE_ORIANE, RESOURCE_EMMA, RESOURCE_IRIS, RESOURCE_STEPH]
  // Monday=1 through Friday=5
  const weekdays = [1, 2, 3, 4, 5]

  for (const resourceId of resourceIds) {
    const scope = `resource:${resourceId}`

    // Check if any rules already exist for this resource
    const existing = await payload.find({
      collection: 'availability-rules' as any,
      where: {
        scope: { equals: scope },
        tenant_id: { equals: TENANT_ID },
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      log('skip', 'availability', scope)
      continue
    }

    for (const day of weekdays) {
      await payload.create({
        collection: 'availability-rules' as any,
        data: {
          tenant_id: TENANT_ID,
          scope,
          kind: 'recurring',
          day_of_week: String(day),
          start_time: '09:00',
          end_time: '18:00',
          is_unavailable: false,
        } as any,
      })
    }
    log('create', 'availability', `${scope} (Mon-Fri 09:00-18:00)`)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱 Seeding Little Biceps V0 data...\n')

  const payload = await getPayload({ config })

  await seedTenant(payload)
  await seedAdminUser(payload)
  await seedResources(payload)
  await seedRooms(payload)
  await seedServices(payload)
  await seedPolicy(payload)
  await seedAvailabilityRules(payload)

  console.log('\n🌱 Seed complete.\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
