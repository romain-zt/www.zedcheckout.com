import type { Access, CollectionBeforeChangeHook, FieldHook } from 'payload'

// V0: hardcoded Little Biceps tenant ID.
// In V1 this will be extracted from the authenticated user's context.
const V0_TENANT_ID = process.env.ZEDSLOT_TENANT_ID ?? '00000000-0000-0000-0000-000000000001'

export function getTenantId(): string {
  return V0_TENANT_ID
}

export const tenantScopedAccess: Access = () => {
  return {
    tenant_id: { equals: getTenantId() },
  }
}

export const injectTenantId: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create') {
    return {
      ...data,
      tenant_id: getTenantId(),
    }
  }
  return data
}

export const defaultTenantId: FieldHook = ({ operation, value }) => {
  if (operation === 'create' && !value) {
    return getTenantId()
  }
  return value
}
