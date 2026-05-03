import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleGetManageBooking } from '@/lib/handlers/manage';
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
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'token is required' },
      { status: 400 },
    );
  }

  const result = await handleGetManageBooking(
    { tenantId, store: getStore(), deps: getDependencies() },
    { bookingId: id, token },
  );
  return NextResponse.json(result.body, { status: result.status });
}
