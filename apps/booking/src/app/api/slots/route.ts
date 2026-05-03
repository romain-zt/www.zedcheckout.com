import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleListSlots } from '@/lib/handlers/slots';
import { tenantRequired } from '@/lib/errors';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

export async function GET(request: NextRequest) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();

  const { searchParams } = request.nextUrl;
  const serviceId = searchParams.get('serviceId');
  if (!serviceId) return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'serviceId is required' }, { status: 400 });

  const result = await handleListSlots(
    { tenantId, store: getStore(), deps: getDependencies() },
    {
      serviceId,
      resourceId: searchParams.get('resourceId') ?? undefined,
      from: searchParams.get('from') ?? new Date().toISOString(),
      to: searchParams.get('to') ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  );
  return NextResponse.json(result.body, { status: result.status });
}
