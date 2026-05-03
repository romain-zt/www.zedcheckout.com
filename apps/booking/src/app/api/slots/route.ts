import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleListSlots } from '@/lib/handlers/slots';
import { tenantRequired } from '@/lib/errors';
import type { BookingStore } from '@/lib/store';

let _store: BookingStore | null = null;
export function setStore(store: BookingStore) { _store = store; }

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();
  if (!_store) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const { searchParams } = request.nextUrl;
  const serviceId = searchParams.get('serviceId');
  if (!serviceId) return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'serviceId is required' }, { status: 400 });

  const result = await handleListSlots(
    { tenantId, store: _store, deps: getDependencies() },
    {
      serviceId,
      resourceId: searchParams.get('resourceId') ?? undefined,
      from: searchParams.get('from') ?? new Date().toISOString(),
      to: searchParams.get('to') ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  );
  return NextResponse.json(result.body, { status: result.status });
}
