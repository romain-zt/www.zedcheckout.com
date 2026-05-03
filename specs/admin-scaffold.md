# [SPEC] Scaffold apps/admin — PayloadCMS v3 admin panel

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

The admin needs a PayloadCMS v3 panel at `admin.zedslot.com` to manage services, resources, rooms, availability rules, policies, bookings, customers, and audit logs. This panel must share the same Postgres database and tables as `apps/booking` — no separate tables.

## Solution

Scaffold `apps/admin` as a Next.js 15 App Router application hosting PayloadCMS v3. Use `@payloadcms/db-postgres` with the `beforeSchemaInit` hook to register existing `@zedslot/database` tables so Payload coexists with the booking app's schema. Collections map 1:1 to domain entities with `dbName` pointing to existing tables.

## Scope

### In Scope
- `apps/admin` scaffold: package.json, tsconfig, next.config, payload.config.ts
- PayloadCMS route files (admin UI, REST API, layout)
- Collections: Services, Resources, Rooms, AvailabilityRules, Policies, Bookings, Customers, AuditLogs
- Tenant-scoping via hardcoded Little Biceps tenant ID (V0)
- Access control: Payload built-in auth (email + password)
- Soft-delete protection on Services (block delete if confirmed bookings reference it)
- Read-only AuditLogs collection
- `beforeSchemaInit` hook to register existing Drizzle tables

### Out of Scope
- Practitioner self-service (V1)
- Calendar view / drag-to-reschedule (V1)
- Visual availability grid editor (V1)
- Admin-initiated booking creation (V1)
- Custom Payload UI components beyond standard collection forms
- Migrations — uses existing tables, no new tables created

## Technical Design

### Architecture

PayloadCMS v3 runs as a Next.js app inside `apps/admin`. It connects to the same Postgres database via `@payloadcms/db-postgres`. The `beforeSchemaInit` hook registers all existing Drizzle tables from `@zedslot/database/schema` so Payload's migration system doesn't try to drop them.

Each Payload collection uses `dbName` to point to the existing table name (e.g., `services`, `resources`). Payload manages its own internal tables (`payload_preferences`, `payload_migrations`, etc.) but does NOT create or modify domain tables.

### Collections

| Collection | Table | Mode |
|---|---|---|
| Services | `services` | Full CRUD |
| Resources | `resources` | Full CRUD |
| Rooms | `rooms` | Full CRUD |
| AvailabilityRules | `availability_rules` | Full CRUD |
| Policies | `policies` | Full CRUD |
| Bookings | `bookings` | Read + status override |
| Customers | `customers` | Read + credit adjustment |
| AuditLogs | `audit_logs` | Read-only |

### Tenant Scoping

All collections enforce `tenant_id` via:
- `access.read`: filter by hardcoded tenant ID
- `beforeChange` hook: inject `tenant_id` on create
- `beforeRead` hook: verify `tenant_id` matches

V0 hardcodes the Little Biceps tenant UUID. V1 extracts tenant from auth context.

### Dependencies
- `payload` — core CMS
- `@payloadcms/next` — Next.js integration
- `@payloadcms/db-postgres` — Drizzle Postgres adapter
- `@payloadcms/richtext-lexical` — rich text editor
- `@zedslot/database` — existing Drizzle schema
- `@zedslot/domain` — entity types

## Edge Cases

| Scenario | Expected Behavior |
|---|---|
| Payload migration on existing DB | `beforeSchemaInit` prevents table conflicts |
| Delete service with confirmed bookings | Blocked by `beforeDelete` hook |
| Edit policy | Creates new row (snapshot semantics) — deferred to booking flow, admin edits in-place for V0 |
| Concurrent admin edits | Payload's default optimistic locking |

## Definition of Done

- [ ] `apps/admin/package.json` with correct deps
- [ ] `payload.config.ts` with Postgres adapter + `beforeSchemaInit`
- [ ] All 8 collections configured with correct `dbName`
- [ ] Tenant-scoping hooks on all collections
- [ ] Soft-delete protection on Services
- [ ] Read-only AuditLogs
- [ ] TypeScript compiles without errors
- [ ] Next.js builds successfully

## Open Questions

- [x] V0 hardcodes Little Biceps tenant (confirmed)
- [x] No separate migration needed — Payload uses existing tables (confirmed)
- [x] Payload's internal tables (payload_migrations, etc.) are OK to create (confirmed)
