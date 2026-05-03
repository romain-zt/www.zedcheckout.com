import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleListServices } from '@/lib/handlers/services';
import { tenantRequired } from '@/lib/errors';
import type { BookingStore } from '@/lib/store';

let _store: BookingStore | null = null;
export function setStore(store: BookingStore) { _store = store; }

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();
  if (!_store) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const result = await handleListServices({ tenantId, store: _store, deps: getDependencies() });
  return NextResponse.json(result.body, { status: result.status });
}
