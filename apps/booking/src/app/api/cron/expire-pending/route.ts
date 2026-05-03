import { NextRequest, NextResponse } from 'next/server';
import { handleExpirePending } from '@/lib/handlers/expire-pending';
import { getDependencies } from '@/lib/dependencies';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

const V0_TENANT_ID = 'lb-tenant-001';

export async function POST(request: NextRequest) {
  await bootstrap();

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const result = await handleExpirePending({
    tenantId: V0_TENANT_ID,
    store: getStore(),
    deps: getDependencies(),
  });
  return NextResponse.json(result.body, { status: result.status });
}
