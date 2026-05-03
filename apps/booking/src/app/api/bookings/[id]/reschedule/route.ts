import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleRescheduleBooking } from '@/lib/handlers/reschedule';
import { tenantRequired } from '@/lib/errors';
import type { BookingStore } from '@/lib/store';

let _store: BookingStore | null = null;
export function setStore(store: BookingStore) { _store = store; }

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return tenantRequired();
  if (!_store) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const { id } = await params;
  const body = await request.json();

  const result = await handleRescheduleBooking(
    { tenantId, store: _store, deps: getDependencies() },
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
