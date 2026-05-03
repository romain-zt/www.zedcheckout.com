import { NextRequest, NextResponse } from 'next/server';
import { handleProcessEmails } from '@/lib/handlers/process-emails';
import { getDependencies } from '@/lib/dependencies';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

import { LB_TENANT_ID } from '@/lib/tenant';

const V0_TENANT_ID = LB_TENANT_ID;

export async function POST(request: NextRequest) {
  await bootstrap();

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const result = await handleProcessEmails({
    tenantId: V0_TENANT_ID,
    store: getStore(),
    deps: getDependencies(),
  });
  return NextResponse.json(result.body, { status: result.status });
}
