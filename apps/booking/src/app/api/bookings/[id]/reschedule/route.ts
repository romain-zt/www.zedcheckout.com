import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleRescheduleBooking } from '@/lib/handlers/reschedule';
import { tenantRequired } from '@/lib/errors';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();

  const { id } = await params;
  const body = await request.json();

  const result = await handleRescheduleBooking(
    { tenantId, store: getStore(), deps: getDependencies() },
    {
      bookingId: id,
      token: body.token,
      newStartsAt: body.newStartsAt,
      newResourceId: body.newResourceId,
      newRoomId: body.newRoomId,
    },
  );
  return NextResponse.json(result.body, { status: result.status });
}
