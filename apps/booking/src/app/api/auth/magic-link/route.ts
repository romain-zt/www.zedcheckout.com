import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleMagicLink } from '@/lib/handlers/auth';
import { tenantRequired } from '@/lib/errors';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

export async function POST(request: NextRequest) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();

  const body = await request.json();
  const result = await handleMagicLink(
    { tenantId, store: getStore(), deps: getDependencies() },
    { email: body.email, returnTo: body.returnTo },
  );
  return NextResponse.json(result.body, { status: result.status });
}
