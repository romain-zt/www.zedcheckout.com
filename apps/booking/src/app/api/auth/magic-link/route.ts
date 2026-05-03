import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleMagicLink } from '@/lib/handlers/auth';
import { tenantRequired } from '@/lib/errors';
import type { BookingStore } from '@/lib/store';

let _store: BookingStore | null = null;
export function setStore(store: BookingStore) { _store = store; }

export async function POST(request: NextRequest) {
  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();
  if (!_store) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const body = await request.json();
  const result = await handleMagicLink(
    { tenantId, store: _store, deps: getDependencies() },
    { email: body.email, returnTo: body.returnTo },
  );
  return NextResponse.json(result.body, { status: result.status });
}
