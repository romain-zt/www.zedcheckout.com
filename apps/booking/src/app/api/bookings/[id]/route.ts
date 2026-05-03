import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleGetBookingStatus } from '@/lib/handlers/booking-status';
import { tenantRequired } from '@/lib/errors';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();

  const { id } = await params;
  const result = await handleGetBookingStatus(
    { tenantId, store: getStore(), deps: getDependencies() },
    { bookingId: id },
  );
  return NextResponse.json(result.body, { status: result.status });
}
