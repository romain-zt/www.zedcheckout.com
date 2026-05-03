/**
 * Idempotent seed script for Little Biceps V0.
 *
 * Seeds tenants via Drizzle (not a Payload collection) and all other
 * entities via the Payload Local API. Uses name/email lookups for
 * idempotency since Payload generates its own UUIDs.
 *
 * Usage:  pnpm db:seed          (from repo root)
 */

import { getPayload } from 'payload'
import { eq, and } from 'drizzle-orm'
import config from '../apps/admin/src/payload.config'

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

type Payload = Awaited<ReturnType<typeof getPayload>>

function log(action: 'skip' | 'create', entity: string, label: string) {
  const prefix = action === 'skip' ? '  ⏭  SKIP' : '  ✅ CREATE'
  console.log(`${prefix}  ${entity} — ${label}`)
}

async function findByField(
  payload: Payload,
  collection: string,
  field: string,
  value: string,
): Promise<any | null> {
  const result = await payload.find({
    collection: collection as any,
    where: { [field]: { equals: value } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedTenant(payload: Payload) {
  console.log('\n— Tenant —')
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

  const existing = await findByField(payload, 'users', 'email', 'admin@littlebiceps.com')
  if (existing) {
    log('skip', 'user', 'admin@littlebiceps.com')
    return
  }

  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@littlebiceps.com',
      password: 'changeme123!',
    } as any,
  })
  log('create', 'user', 'admin@littlebiceps.com')
}

async function seedResources(payload: Payload): Promise<Record<string, string>> {
  console.log('\n— Resources —')

  const names = ['Oriane', 'Emmanuelle', 'Iris', 'Stéphanie']
  const idMap: Record<string, string> = {}

  for (const name of names) {
    const existing = await findByField(payload, 'resources', 'name', name)
    if (existing) {
      log('skip', 'resource', name)
      idMap[name] = existing.id
      continue
    }

    const created = await payload.create({
      collection: 'resources',
      data: {
        tenant_id: TENANT_ID,
        name,
        status: 'active',
      } as any,
    })
    idMap[name] = created.id
    log('create', 'resource', name)
  }

  return idMap
}

async function seedRooms(payload: Payload): Promise<Record<string, string>> {
  console.log('\n— Rooms —')

  const names = ['Salle A', 'Salle B']
  const idMap: Record<string, string> = {}

  for (const name of names) {
    const existing = await findByField(payload, 'rooms', 'name', name)
    if (existing) {
      log('skip', 'room', name)
      idMap[name] = existing.id
      continue
    }

    const created = await payload.create({
      collection: 'rooms',
      data: {
        tenant_id: TENANT_ID,
        name,
        bookable_without_resource: false,
        status: 'active',
      } as any,
    })
    idMap[name] = created.id
    log('create', 'room', name)
  }

  return idMap
}

async function seedServices(payload: Payload): Promise<Record<string, string>> {
  console.log('\n— Services —')

  const defs = [
    { name_fr: 'Drainage Renata França', name_en: 'Renata França Lymphatic Drainage', duration_minutes: 60, price_cents: 12000 },
    { name_fr: 'Massage Deep Tissue', name_en: 'Deep Tissue Massage', duration_minutes: 90, price_cents: 15000 },
    { name_fr: 'Soin Visage', name_en: 'Facial Treatment', duration_minutes: 45, price_cents: 9000 },
  ]

  const idMap: Record<string, string> = {}

  for (const s of defs) {
    const existing = await findByField(payload, 'services', 'name_fr', s.name_fr)
    if (existing) {
      log('skip', 'service', s.name_fr)
      idMap[s.name_fr] = existing.id
      continue
    }

    const created = await payload.create({
      collection: 'services',
      data: {
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
    idMap[s.name_fr] = created.id
    log('create', 'service', s.name_fr)
  }

  return idMap
}

async function seedServiceLinks(
  payload: Payload,
  serviceIds: Record<string, string>,
  resourceIds: Record<string, string>,
  roomIds: Record<string, string>,
) {
  console.log('\n— Service ↔ Resource/Room links —')

  const db = (payload.db as any).drizzle
  const { serviceResources, serviceRooms } = await import('@zedslot/database/schema')

  const allServiceIds = Object.values(serviceIds)
  const allResourceIds = Object.values(resourceIds)
  const allRoomIds = Object.values(roomIds)

  // Check if links already exist
  const existingResLinks = await db.select().from(serviceResources)
  if (existingResLinks.length > 0) {
    log('skip', 'links', `${existingResLinks.length} resource links exist`)
  } else {
    const resLinks = allServiceIds.flatMap((sId) =>
      allResourceIds.map((rId) => ({ serviceId: sId, resourceId: rId })),
    )
    await db.insert(serviceResources).values(resLinks)
    log('create', 'links', `${resLinks.length} service↔resource links`)
  }

  const existingRoomLinks = await db.select().from(serviceRooms)
  if (existingRoomLinks.length > 0) {
    log('skip', 'links', `${existingRoomLinks.length} room links exist`)
  } else {
    const roomLinks = allServiceIds.flatMap((sId) =>
      allRoomIds.map((rmId) => ({ serviceId: sId, roomId: rmId })),
    )
    await db.insert(serviceRooms).values(roomLinks)
    log('create', 'links', `${roomLinks.length} service↔room links`)
  }
}

async function seedPolicy(payload: Payload) {
  console.log('\n— Policy —')

  const existing = await findByField(payload, 'policies', 'scope', 'global')
  if (existing) {
    log('skip', 'policy', 'global')
    return
  }

  await payload.create({
    collection: 'policies',
    data: {
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

async function seedAvailabilityRules(
  payload: Payload,
  resourceIds: Record<string, string>,
) {
  console.log('\n— Availability Rules —')

  const weekdays = [1, 2, 3, 4, 5]

  for (const [name, resourceId] of Object.entries(resourceIds)) {
    const scope = `resource:${resourceId}`

    const existing = await payload.find({
      collection: 'availability-rules' as any,
      where: {
        scope: { equals: scope },
        tenant_id: { equals: TENANT_ID },
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      log('skip', 'availability', `${name} (${scope})`)
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
    log('create', 'availability', `${name} Mon-Fri 09:00-18:00`)
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
  const resourceIds = await seedResources(payload)
  const roomIds = await seedRooms(payload)
  const serviceIds = await seedServices(payload)
  await seedServiceLinks(payload, serviceIds, resourceIds, roomIds)
  await seedPolicy(payload)
  await seedAvailabilityRules(payload, resourceIds)

  console.log('\n🌱 Seed complete.\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
