import type { Service, Resource, Room, Policy, AvailabilityRule, Tenant } from '@zedslot/domain';
import { InMemoryPaymentsClient } from '@zedslot/payments/__test-double';
import { InMemoryEmailSender } from '@zedslot/email/__test-double';
import { InMemoryAuthClient } from '@zedslot/auth/__test-double';
import { InMemoryShopifyClient } from '@zedslot/shopify/__test-double';
import { InMemoryBookingStore } from '../lib/in-memory-store.js';
import type { RequestContext } from '../lib/context.js';
import type { Dependencies } from '../lib/dependencies.js';
import { seedTenant } from '../lib/tenant.js';

export const TENANT_ID = 'lb-tenant-001';

export function createTestDeps(): Dependencies & {
  payments: InMemoryPaymentsClient;
  email: InMemoryEmailSender;
  auth: InMemoryAuthClient;
  shopify: InMemoryShopifyClient;
} {
  return {
    payments: new InMemoryPaymentsClient(),
    email: new InMemoryEmailSender(),
    auth: new InMemoryAuthClient(),
    shopify: new InMemoryShopifyClient(),
  };
}

export function createTestStore(): InMemoryBookingStore {
  return new InMemoryBookingStore();
}

export function createTestContext(
  store: InMemoryBookingStore,
  deps: Dependencies,
): RequestContext {
  return { tenantId: TENANT_ID, store, deps };
}

export function seedTestTenant(): Tenant {
  const tenant: Tenant = {
    id: TENANT_ID,
    slug: 'littlebiceps',
    displayName: 'Little Biceps',
    timezone: 'Europe/Paris',
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    branding: { logoUrl: null, primaryColor: null },
    createdAt: new Date('2026-01-01'),
  };
  seedTenant(tenant);
  return tenant;
}

export function createTestService(overrides?: Partial<Service>): Service {
  return {
    id: 'svc-001',
    tenantId: TENANT_ID,
    name: { fr: 'Drainage Renata França', en: 'Renata França Drainage' },
    description: null,
    durationMinutes: 60,
    priceCents: 12000,
    eligibleResourceIds: ['res-001'],
    eligibleRoomIds: ['room-001', 'room-002'],
    requiresResource: true,
    requiresRoom: true,
    status: 'active',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function createTestResource(overrides?: Partial<Resource>): Resource {
  return {
    id: 'res-001',
    tenantId: TENANT_ID,
    name: 'Oriane',
    email: 'oriane@littlebiceps.com',
    status: 'active',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function createTestRoom(overrides?: Partial<Room>): Room {
  return {
    id: 'room-001',
    tenantId: TENANT_ID,
    name: 'Room A',
    bookableWithoutResource: false,
    status: 'active',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function createTestPolicy(overrides?: Partial<Policy>): Policy {
  return {
    id: 'policy-001',
    tenantId: TENANT_ID,
    scope: 'global',
    freeCancelHours: 24,
    lateCancelBehavior: 'credit',
    noShowBehavior: 'charged',
    freeRescheduleHours: 24,
    maxReschedules: 2,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function createTestAvailabilityRule(overrides?: Partial<AvailabilityRule>): AvailabilityRule {
  return {
    id: 'rule-001',
    tenantId: TENANT_ID,
    scope: 'resource:res-001',
    kind: 'recurring',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00',
    dateRangeStart: null,
    dateRangeEnd: null,
    isUnavailable: false,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function tomorrow9am(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export function futureDate(daysAhead: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
}
