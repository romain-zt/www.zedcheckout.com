# [SPEC] Payload Migrations + Little Biceps Seed

## Meta
- **Status:** Implemented
- **Classification:** 2. Project Primitive
- **Target:** zedslot
- **Author:** Agent
- **Date:** 2026-05-03

## Problem

The database has a Drizzle schema but no migrations have been generated, and no migration runner config exists. Without migrations:
- `apps/admin` (PayloadCMS) cannot start against a fresh Neon database
- The EXCLUDE constraints for race-proof booking (`no_room_overlap`, `no_resource_overlap`) exist in schema definition only — they aren't applied to any database
- There's no seed data, so a deployed system has empty tables and nothing works

PayloadCMS v3 with the Drizzle adapter owns the migration lifecycle — its `payload migrate` commands wrap Drizzle Kit internally. Running raw Drizzle Kit separately would conflict with Payload's migration tracking in `_prisma_migrations` / `payload_migrations`.

This track is blocked by Track E (PayloadCMS admin) landing on main.

## Solution

Use Payload's migration system to generate the initial migration from the collection schemas, then add a custom migration for EXCLUDE constraints (which Payload/Drizzle Kit cannot generate natively). Create an idempotent seed script using Payload's Local API.

## Scope

### In Scope
- Initial migration via `payload migrate:create` (generates Payload internal tables + business tables from collections)
- Custom follow-up migration for `btree_gist` extension + EXCLUDE constraints
- `tooling/seed.ts` — Little Biceps V0 data via Payload Local API (idempotent, fixed UUIDs)
- Migration + seed scripts in `package.json`

### Out of Scope
- Raw Drizzle Kit usage (`drizzle-kit generate/push/migrate`) — Payload owns migrations
- Production database provisioning on Neon — that's Phase 11 (deployment)
- Data for any tenant other than Little Biceps
- Automated migration in CI — that's Phase 11 (deployment)
- Rollback migrations — manual recovery via `payload migrate:reset` if needed

## Technical Design

### Migrations

**Step 1 — Initial migration:**

```bash
pnpm --filter @zedslot/admin payload migrate:create
```

Generates SQL from Payload collection schemas + registered Drizzle tables. Creates Payload's internal tables (`users`, `payload_preferences`, etc.) alongside business tables.

**Step 2 — EXCLUDE constraints (custom migration):**

Create via `payload migrate:create --empty` (or manual SQL migration file), containing:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT no_room_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    room_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'confirmed');

ALTER TABLE bookings ADD CONSTRAINT no_resource_overlap
  EXCLUDE USING gist (
    tenant_id WITH =,
    resource_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'confirmed' AND resource_id IS NOT NULL);
```

**Scripts in `apps/admin/package.json`:**

```json
"db:migrate": "payload migrate",
"db:migrate:create": "payload migrate:create"
```

### Seed Script

`tooling/seed.ts` — uses `getPayload()` + `payload.create()`:

**Data:**

| Entity | Values |
|--------|--------|
| Tenant | id=`lb-tenant-001`, slug=`littlebiceps`, displayName=`Little Biceps`, timezone=`Europe/Paris`, defaultLocale=`fr` |
| Admin user | `admin@littlebiceps.com` (for Payload login) |
| Resources (4) | Oriane, Emmanuelle, Iris, Stéphanie |
| Rooms (2) | Room A, Room B |
| Services (3) | Drainage Renata França 60min (€120), Massage Deep Tissue 90min (€150), Soin Visage 45min (€90) |
| Service eligibility | All resources eligible for all services; both rooms eligible for all services |
| Availability rules | Mon-Fri 9:00-18:00 recurring for each resource |
| Policy | Global, freeCancelHours=24, lateCancelBehavior=`credit`, noShowBehavior=`charged`, freeRescheduleHours=24, maxReschedules=2 |

**Idempotency:** Use fixed UUIDs for all entities. Check-before-insert pattern: query by ID first, skip if exists.

**Script in root `package.json`:**

```json
"db:seed": "tsx tooling/seed.ts"
```

### API / Interfaces

No new public APIs. Seed script is a CLI tool only.

### Dependencies

| Dependency | Used by | Notes |
|-----------|---------|-------|
| PayloadCMS CLI | `apps/admin` | Already a dependency |
| `tsx` | `tooling/seed.ts` | Runtime for TypeScript seed script |
| `@zedslot/database` | `tooling/seed.ts` | Schema types for type-safe seed |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| `payload migrate` run on already-migrated database | No-op — Payload tracks applied migrations by checksum |
| Seed script run twice | Idempotent — checks for existing records by fixed UUID, skips if present |
| EXCLUDE constraint migration run on DB without `btree_gist` extension | `CREATE EXTENSION IF NOT EXISTS` handles this gracefully |
| Seed script run before migrations | Fails with clear error — tables don't exist yet |
| Resource availability rule with no matching resource ID | Seed script uses fixed UUIDs for both resources and rules — referential integrity guaranteed |
| `payload migrate:create` generates different column names than Drizzle schema | Payload reads from its collection config; Drizzle schema must match exactly — verify generated SQL |

## Definition of Done

- [ ] `payload migrate:create` generates initial migration SQL without errors
- [ ] Generated migration creates all business tables matching `packages/database/src/schema/`
- [ ] EXCLUDE constraints migration applies `no_room_overlap` and `no_resource_overlap` successfully
- [ ] `btree_gist` extension is created if not present
- [ ] `tooling/seed.ts` exists and populates all Little Biceps V0 data
- [ ] Seed is idempotent — running twice produces no duplicate records and no errors
- [ ] Seed uses Payload Local API (`payload.create()`), not raw Drizzle inserts
- [ ] `pnpm db:seed` runs successfully against a migrated local database
- [ ] All seeded services have correct resource and room eligibility via join tables
- [ ] Availability rules create Mon-Fri 9:00-18:00 for all 4 resources

## Open Questions

- [x] Use Payload migrations or raw Drizzle Kit? — Payload, since PayloadCMS v3 owns the migration lifecycle.
- [x] Seed via Payload Local API or raw Drizzle? — Payload Local API to respect hooks and validation.
