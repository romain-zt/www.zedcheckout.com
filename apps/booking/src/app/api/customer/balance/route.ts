import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleGetBalance } from '@/lib/handlers/customer-balance';
import { tenantRequired, unauthorized } from '@/lib/errors';
import type { BookingStore } from '@/lib/store';

let _store: BookingStore | null = null;
export function setStore(store: BookingStore) { _store = store; }

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();
  if (!_store) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const sessionCookie = request.cookies.get('zedslot_session');
  if (!sessionCookie?.value) return unauthorized('Authentication required');

  let session: { email: string; tenantId: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return unauthorized('Invalid session');
  }

  if (session.tenantId !== tenantId) return unauthorized('Session tenant mismatch');

  const result = await handleGetBalance(
    { tenantId, store: _store, deps: getDependencies() },
    { email: session.email },
  );
  return NextResponse.json(result.body, { status: result.status });
}
