import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleVerify } from '@/lib/handlers/auth';
import { tenantRequired } from '@/lib/errors';
import type { BookingStore } from '@/lib/store';

let _store: BookingStore | null = null;
export function setStore(store: BookingStore) { _store = store; }

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();
  if (!_store) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const token = request.nextUrl.searchParams.get('token') ?? '';
  const result = await handleVerify(
    { tenantId, store: _store, deps: getDependencies() },
    { token },
  );

  const response = NextResponse.json(result.body, { status: result.status });

  if (result.session) {
    response.cookies.set('zedslot_session', JSON.stringify(result.session), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60,
      path: '/',
    });
  }

  return response;
}
