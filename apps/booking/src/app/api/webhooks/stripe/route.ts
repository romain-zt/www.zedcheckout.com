import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleStripeWebhook } from '@/lib/handlers/stripe-webhook';
import type { BookingStore } from '@/lib/store';

let _store: BookingStore | null = null;
export function setStore(store: BookingStore) { _store = store; }

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(request: NextRequest) {
  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 400 });
  if (!_store) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  const result = await handleStripeWebhook(
    { tenantId, store: _store, deps: getDependencies() },
    { body, signature, webhookSecret: WEBHOOK_SECRET },
  );
  return NextResponse.json(result.body, { status: result.status });
}
