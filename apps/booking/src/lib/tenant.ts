import type { Tenant } from '@zedslot/domain';

/**
 * Canonical Little Biceps tenant UUID. Matches tooling/seed.ts and
 * the DB schema (uuid column). All V0 code references this constant.
 */
export const LB_TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/**
 * Hostname → tenant mapping.
 * In V0 this is a static map; V1+ resolves via DB lookup.
 */
const HOSTNAME_TO_TENANT_ID: Record<string, string> = {
  'book.littlebiceps.com': LB_TENANT_ID,
  'littlebiceps.zedslot.com': LB_TENANT_ID,
  'localhost': LB_TENANT_ID,
};

export function resolveTenantId(hostname: string): string | null {
  const normalized = hostname.split(':')[0]!.toLowerCase();
  return HOSTNAME_TO_TENANT_ID[normalized] ?? null;
}

/**
 * In-memory tenant store. V1+ uses DB.
 * Seeded at startup for pilot.
 */
const TENANTS: Map<string, Tenant> = new Map();

export function seedTenant(tenant: Tenant): void {
  TENANTS.set(tenant.id, tenant);
}

export function getTenant(tenantId: string): Tenant | null {
  return TENANTS.get(tenantId) ?? null;
}
