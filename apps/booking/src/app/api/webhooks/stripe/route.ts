import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantId } from '@/lib/tenant';
import { getDependencies } from '@/lib/dependencies';
import { handleStripeWebhook } from '@/lib/handlers/stripe-webhook';
import { bootstrap } from '@/lib/bootstrap';
import { getStore } from '@/lib/store-provider';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(request: NextRequest) {
  await bootstrap();

  const host = request.headers.get('host') ?? 'localhost';
  const tenantId = resolveTenantId(host);
  if (!tenantId) return NextResponse.json({ error: 'TENANT_NOT_FOUND' }, { status: 400 });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  const result = await handleStripeWebhook(
    { tenantId, store: getStore(), deps: getDependencies() },
    { body, signature, webhookSecret: WEBHOOK_SECRET },
  );
  return NextResponse.json(result.body, { status: result.status });
}
