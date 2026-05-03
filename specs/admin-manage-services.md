# [SPEC] Admin manages services

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/admin-manage-services.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

The admin needs to configure bookable services (name, duration, price, eligible practitioners, eligible rooms) in PayloadCMS before the booking subdomain can function. Services drive everything downstream: slot generation, pricing, room assignment.

## Solution

PayloadCMS `services` collection with i18n name/description, practitioner/room eligibility, and active/disabled status. Disabling a service hides it from the booking subdomain within 60s. Deletion blocked if confirmed bookings reference it.

## Scope

### In Scope
- PayloadCMS Services collection (CRUD)
- i18n fields (name, description) — FR/EN
- Eligibility relationships (resources, rooms)
- `requiresResource` / `requiresRoom` flags with validation
- Status: active / disabled
- Soft-delete protection (can't delete with confirmed bookings)
- Audit log on create/edit/disable
- Cache invalidation (booking subdomain refresh ≤ 60s)

### Out of Scope
- Per-service policy overrides (data model supports, UI deferred)
- Per-practitioner pricing
- Service categories / collections
- Service images / media

## Technical Design

### Data Models

```ts
// packages/domain/src/entities/service.ts
interface Service {
  id: string;
  tenantId: string;
  name: Record<'fr' | 'en', string>;
  description: Record<'fr' | 'en', string> | null;
  durationMinutes: number;
  priceCents: number;
  eligibleResourceIds: string[];
  eligibleRoomIds: string[];
  requiresResource: boolean;
  requiresRoom: boolean;
  status: 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}
```

### DB Tables (Drizzle)

```ts
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  nameFr: text('name_fr').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionFr: text('description_fr'),
  descriptionEn: text('description_en'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceCents: integer('price_cents').notNull(),
  requiresResource: boolean('requires_resource').notNull().default(true),
  requiresRoom: boolean('requires_room').notNull().default(true),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const serviceResources = pgTable('service_resources', {
  serviceId: uuid('service_id').notNull().references(() => services.id),
  resourceId: uuid('resource_id').notNull().references(() => resources.id),
}, (t) => ({ pk: primaryKey(t.serviceId, t.resourceId) }));

export const serviceRooms = pgTable('service_rooms', {
  serviceId: uuid('service_id').notNull().references(() => services.id),
  roomId: uuid('room_id').notNull().references(() => rooms.id),
}, (t) => ({ pk: primaryKey(t.serviceId, t.roomId) }));
```

### API / Interfaces

Services are managed via PayloadCMS admin UI. The booking subdomain reads via:

#### `GET /api/services?tenantId={id}`
Returns active services with resolved eligibility.

### Dependencies
- `packages/domain` — `Service` entity
- `packages/database` — services, service_resources, service_rooms tables
- PayloadCMS v3 (apps/admin) — collection configuration

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Create service | N/A (admin action) | Standard Payload create |
| Disable service | `service.id` | Idempotent status update |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| `requiresResource=true` but no eligible resources | Validation error: must select at least one practitioner |
| Delete service with confirmed bookings | Blocked; admin must disable instead |
| Disable service while checkout in progress | `canBook` pre-check catches disabled service → 400 |
| Edit service price | Existing pending bookings use the price at creation time (via Payment.totalCents) |
| Service with 0 eligible rooms but `requiresRoom=true` | Validation error |

## Definition of Done

- [ ] `packages/domain`: `Service` entity typed
- [ ] `packages/database`: services + junction tables schema + migration
- [ ] PayloadCMS: Services collection with i18n, eligibility, validation
- [ ] Soft-delete protection hook (block delete if confirmed bookings exist)
- [ ] Audit log entries on create/edit/disable
- [ ] Booking subdomain reads active services within 60s of change
- [ ] Validation: `requiresResource` → non-empty eligibleResources; `requiresRoom` → non-empty eligibleRooms
- [ ] No hardcoded service values

## Open Questions

- [x] Single price per service (no per-practitioner pricing in V0) — confirmed
