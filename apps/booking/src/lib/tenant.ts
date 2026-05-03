import type { Tenant } from '@zedslot/domain';

/**
 * Hostname → tenant mapping.
 * In V0 this is a static map; V1+ resolves via DB lookup.
 */
const HOSTNAME_TO_TENANT_ID: Record<string, string> = {
  'book.littlebiceps.com': 'lb-tenant-001',
  'littlebiceps.zedslot.com': 'lb-tenant-001',
  'localhost': 'lb-tenant-001',
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
