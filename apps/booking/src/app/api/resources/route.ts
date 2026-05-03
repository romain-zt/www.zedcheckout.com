import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleListResources } from '@/lib/handlers/resources';
import { tenantRequired } from '@/lib/errors';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

export async function GET(request: NextRequest) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();

  const idsParam = request.nextUrl.searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : undefined;

  const result = await handleListResources(
    { tenantId, store: getStore(), deps: getDependencies() },
    { ids },
  );
  return NextResponse.json(result.body, { status: result.status });
}
