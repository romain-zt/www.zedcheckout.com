import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleVerify } from '@/lib/handlers/auth';
import { tenantRequired } from '@/lib/errors';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

export async function GET(request: NextRequest) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();

  const token = request.nextUrl.searchParams.get('token') ?? '';
  const result = await handleVerify(
    { tenantId, store: getStore(), deps: getDependencies() },
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
