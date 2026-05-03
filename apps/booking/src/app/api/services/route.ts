import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleListServices } from '@/lib/handlers/services';
import { tenantRequired } from '@/lib/errors';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

export async function GET(request: NextRequest) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();

  const result = await handleListServices({ tenantId, store: getStore(), deps: getDependencies() });
  return NextResponse.json(result.body, { status: result.status });
}
