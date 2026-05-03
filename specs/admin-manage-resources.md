# [SPEC] Admin manages resources (practitioners) and availability

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** `docs/stories/admin-manage-resources.md`
- **Author:** Agent (Spec)
- **Date:** 2026-05-03

## Problem

Practitioners (resources) and their working hours drive slot generation. The admin needs to configure recurring weekly schedules and one-off overrides (vacations, special hours). The booking engine must compose these rules correctly: overrides always win.

## Solution

PayloadCMS `resources` and `availability_rules` collections. Rules scoped to `resource:<id>`. The booking engine's `listAvailableSlots` composes recurring + override rules per the "override wins" rule.

## Scope

### In Scope
- PayloadCMS Resources collection (name, email, status)
- PayloadCMS AvailabilityRules collection (scoped to resources)
- Recurring rules (day-of-week + time range)
- Override rules (date range + time range, or "unavailable" = full block)
- Override-wins-over-recurring composition
- Disable resource → hidden from new bookings, preserves existing

### Out of Scope
- Practitioner self-service (V1)
- Per-practitioner pricing
- Practitioner profile photos / bios
- Visual weekly grid editor (V0 uses standard Payload form; grid is V1)

## Technical Design

### Data Models

```ts
// packages/domain/src/entities/resource.ts
interface Resource {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  status: 'active' | 'disabled';
  createdAt: Date;
}

// packages/domain/src/entities/availability-rule.ts
type AvailabilityScope = `resource:${string}` | `room:${string}`;

interface AvailabilityRule {
  id: string;
  tenantId: string;
  scope: AvailabilityScope;
  kind: 'recurring' | 'override';
  dayOfWeek: number | null;   // 0=Sunday..6=Saturday (null for overrides with dateRange)
  startTime: string;           // 'HH:mm' in tenant timezone
  endTime: string;             // 'HH:mm' in tenant timezone
  dateRangeStart: Date | null; // for overrides
  dateRangeEnd: Date | null;   // for overrides
  isUnavailable: boolean;      // true = blocks availability (vacation)
  createdAt: Date;
}
```

### DB Tables (Drizzle)

```ts
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  email: text('email'),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const availabilityRules = pgTable('availability_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  scope: text('scope').notNull(), // 'resource:<uuid>' or 'room:<uuid>'
  kind: text('kind', { enum: ['recurring', 'override'] }).notNull(),
  dayOfWeek: integer('day_of_week'),
  startTime: text('start_time').notNull(),  // 'HH:mm'
  endTime: text('end_time').notNull(),
  dateRangeStart: timestamp('date_range_start', { withTimezone: true }),
  dateRangeEnd: timestamp('date_range_end', { withTimezone: true }),
  isUnavailable: boolean('is_unavailable').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### Availability Composition Algorithm (booking-engine)

```ts
// packages/booking-engine/src/availability.ts
function getAvailableWindows(
  date: Date,
  rules: AvailabilityRule[],
  tz: string,
): TimeWindow[] {
  // 1. Get recurring rules for this day-of-week → base windows
  // 2. Get overrides that cover this date
  // 3. For each override:
  //    - If isUnavailable=true → subtract from base windows
  //    - If isUnavailable=false → replace base windows with override windows
  // 4. Return merged, non-overlapping windows
}
```

Key invariant: **override always wins**. If recurring says "open Mon 9-18" and override says "Mon closed", no slots for that Monday.

### Dependencies
- `packages/domain` — `Resource`, `AvailabilityRule` entities
- `packages/booking-engine` — `getAvailableWindows`, `listAvailableSlots`
- `packages/database` — resources, availability_rules tables

### Idempotency

| Operation | Key | Behavior |
|-----------|-----|----------|
| Create resource | N/A (admin action) | Standard Payload create |
| Create/edit rule | `rule.id` | Standard Payload update |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Recurring "Mon-Fri 9-18" + override "Mon closed" | No slots on that Monday |
| Recurring "Mon 9-18" + override "Mon 14-17 only" | Slots only 14-17 on that Monday |
| No recurring rules for a day | No slots for that day (unless override provides them) |
| Override spans multiple days | Applied to each day in the range |
| Disable resource with pending bookings | Pending bookings expire normally; resource hidden from new bookings |
| Two overlapping recurring rules | Union of windows (e.g., "Mon 9-12" + "Mon 14-18" = two windows) |
| Override `isUnavailable=true` for a date range in the past | Ignored by slot generation (past dates excluded) |

## Definition of Done

- [ ] `packages/domain`: `Resource`, `AvailabilityRule` entities typed
- [ ] `packages/database`: resources + availability_rules tables + migration
- [ ] `packages/booking-engine`: `getAvailableWindows` with property tests
- [ ] Property test: override always wins over recurring for same date
- [ ] Property test: union of recurring rules produces non-overlapping sorted windows
- [ ] PayloadCMS: Resources + AvailabilityRules collections
- [ ] Disabled resource hidden from new bookings within 60s
- [ ] Time stored in tenant timezone (HH:mm), dates in UTC

## Open Questions

- [x] Override-wins is absolute: an override can add availability on a normally-off day (confirmed)
