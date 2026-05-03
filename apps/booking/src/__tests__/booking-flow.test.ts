import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTestDeps,
  createTestStore,
  createTestContext,
  createTestService,
  createTestResource,
  createTestRoom,
  createTestPolicy,
  createTestAvailabilityRule,
  seedTestTenant,
  TENANT_ID,
  futureDate,
} from './helpers';
import { handleCreateBooking } from '../lib/handlers/bookings';
import { handleListServices } from '../lib/handlers/services';
import { handleStripeWebhook } from '../lib/handlers/stripe-webhook';
import { handleExpirePending } from '../lib/handlers/expire-pending';
import { handleProcessEmails } from '../lib/handlers/process-emails';
import { handleCancelBooking } from '../lib/handlers/cancel';
import { handleRescheduleBooking } from '../lib/handlers/reschedule';
import { handleMagicLink, handleVerify, resetRateLimiter } from '../lib/handlers/auth';
import { handleGetBalance } from '../lib/handlers/customer-balance';
import type { InMemoryBookingStore } from '../lib/in-memory-store';

let store: InMemoryBookingStore;
let deps: ReturnType<typeof createTestDeps>;

function body(result: { body: Record<string, unknown> }) {
  return result.body as Record<string, unknown>;
}

beforeEach(() => {
  store = createTestStore();
  deps = createTestDeps();
  seedTestTenant();
  resetRateLimiter();

  store.services.push(createTestService());
  store.resources.push(createTestResource());
  store.rooms.push(createTestRoom());
  store.rooms.push(createTestRoom({ id: 'room-002', name: 'Room B' }));
  store.policies.push(createTestPolicy());

  for (let day = 1; day <= 5; day++) {
    store.availabilityRules.push(
      createTestAvailabilityRule({
        id: `rule-res-${day}`,
        scope: 'resource:res-001',
        dayOfWeek: day,
      }),
    );
  }
});

describe('GET /api/services', () => {
  it('returns active services for tenant', async () => {
    const ctx = createTestContext(store, deps);
    const result = await handleListServices(ctx);

    expect(result.status).toBe(200);
    expect((result.body.services as unknown[]).length).toBe(1);
    expect((result.body.services as Array<{ id: string }>)[0]!.id).toBe('svc-001');
  });

  it('excludes disabled services', async () => {
    store.services.push(createTestService({ id: 'svc-disabled', status: 'disabled' }));
    const ctx = createTestContext(store, deps);
    const result = await handleListServices(ctx);
    expect((result.body.services as unknown[]).length).toBe(1);
  });
});

describe('POST /api/bookings — full booking flow', () => {
  it('creates pending booking + PaymentIntent', async () => {
    const ctx = createTestContext(store, deps);
    const startsAt = futureDate(2, 10);

    const result = await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: startsAt.toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });

    expect(result.status).toBe(201);
    expect(body(result).bookingId).toBeDefined();
    expect(body(result).paymentIntentClientSecret).toBeDefined();
    expect(body(result).expiresAt).toBeDefined();

    expect(store.bookings).toHaveLength(1);
    expect(store.bookings[0]!.status).toBe('pending');
    expect(store.payments).toHaveLength(1);
    expect(store.customers).toHaveLength(1);
  });

  it('is idempotent — returns same booking on retry', async () => {
    const ctx = createTestContext(store, deps);
    const startsAt = futureDate(2, 10);
    const input = {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: startsAt.toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    };

    const r1 = await handleCreateBooking(ctx, input);
    const r2 = await handleCreateBooking(ctx, input);

    expect(body(r1).bookingId).toBe(body(r2).bookingId);
    expect(store.bookings).toHaveLength(1);
  });

  it('returns 409 on conflict with next-available suggestion', async () => {
    const ctx = createTestContext(store, deps);
    const startsAt = futureDate(2, 10);

    await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: startsAt.toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });

    const result = await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: startsAt.toISOString(),
      customer: { name: 'Bob', email: 'bob@test.com' },
    });

    expect(result.status).toBe(409);
    expect(body(result).error).toBe('BOOKING_CONFLICT');
  });

  it('rejects disabled service', async () => {
    store.services[0]!.status = 'disabled';
    const ctx = createTestContext(store, deps);
    const result = await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: futureDate(2, 10).toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });
    expect(result.status).toBe(400);
    expect(body(result).error).toBe('SERVICE_DISABLED');
  });

  it('auto-assigns room when roomId not provided', async () => {
    const ctx = createTestContext(store, deps);
    const result = await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      startsAt: futureDate(2, 10).toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });
    expect(result.status).toBe(201);
    expect(store.bookings[0]!.roomId).toBeDefined();
  });
});

describe('Stripe webhook', () => {
  it('confirms booking on payment_intent.succeeded', async () => {
    const ctx = createTestContext(store, deps);
    const startsAt = futureDate(2, 10);

    await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: startsAt.toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });

    const payment = store.payments[0]!;
    const stripeId = payment.stripePaymentIntentId!;
    deps.payments.simulatePaymentSuccess(stripeId);

    const webhookResult = await handleStripeWebhook(ctx, {
      body: JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: stripeId } },
      }),
      signature: 'test',
      webhookSecret: 'test',
    });

    expect(webhookResult.status).toBe(200);
    expect(store.bookings[0]!.status).toBe('confirmed');
    expect(store.payments[0]!.status).toBe('succeeded');
    expect(store.scheduledEmails.length).toBeGreaterThanOrEqual(1);
  });

  it('cancels booking on payment_intent.payment_failed', async () => {
    const ctx = createTestContext(store, deps);

    await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: futureDate(2, 10).toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });

    const stripeId = store.payments[0]!.stripePaymentIntentId!;

    const webhookResult = await handleStripeWebhook(ctx, {
      body: JSON.stringify({
        type: 'payment_intent.payment_failed',
        data: { object: { id: stripeId } },
      }),
      signature: 'test',
      webhookSecret: 'test',
    });

    expect(webhookResult.status).toBe(200);
    expect(store.bookings[0]!.status).toBe('cancelled');
    expect(store.payments[0]!.status).toBe('failed');
  });

  it('is idempotent — replaying succeeded webhook is a no-op', async () => {
    const ctx = createTestContext(store, deps);

    await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: futureDate(2, 10).toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });

    const stripeId = store.payments[0]!.stripePaymentIntentId!;
    const webhookBody = JSON.stringify({
      type: 'payment_intent.succeeded',
      data: { object: { id: stripeId } },
    });

    await handleStripeWebhook(ctx, { body: webhookBody, signature: 'test', webhookSecret: 'test' });
    const result = await handleStripeWebhook(ctx, { body: webhookBody, signature: 'test', webhookSecret: 'test' });

    expect(body(result).skipped).toBe('already_confirmed');
    expect(store.bookings).toHaveLength(1);
  });
});

describe('Credit-only payment', () => {
  it('confirms immediately when pack credit covers total', async () => {
    const ctx = createTestContext(store, deps);

    store.customers.push({
      id: 'cust-credit',
      tenantId: TENANT_ID,
      shopifyCustomerId: null,
      email: 'rich@test.com',
      displayName: 'Rich Customer',
      phone: null,
      packCreditCents: 20000,
      giftCardBalanceCents: 0,
      createdAt: new Date(),
    });

    const result = await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: futureDate(2, 10).toISOString(),
      customer: { name: 'Rich Customer', email: 'rich@test.com' },
      paymentMethod: 'credit',
      creditAmountCents: 12000,
    });

    expect(result.status).toBe(201);
    expect(body(result).confirmed).toBe(true);
    expect(body(result).paymentIntentClientSecret).toBeNull();
    expect(store.bookings[0]!.status).toBe('confirmed');
    expect(store.payments[0]!.paidByPackCents).toBe(12000);
    expect(store.payments[0]!.paidByCardCents).toBe(0);
  });
});

describe('Pending expiry cron', () => {
  it('expires stale pending bookings', async () => {
    const ctx = createTestContext(store, deps);

    store.bookings.push({
      id: 'old-booking',
      tenantId: TENANT_ID,
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      customerId: 'cust-001',
      startsAt: futureDate(2, 10),
      endsAt: futureDate(2, 11),
      status: 'pending',
      paymentId: 'pay-001',
      policyId: 'policy-001',
      rescheduleCount: 0,
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    const result = await handleExpirePending(ctx);
    expect(body(result).expired).toBe(1);
    expect(store.bookings[0]!.status).toBe('cancelled');
  });

  it('releases pack holds on expiry', async () => {
    const ctx = createTestContext(store, deps);

    store.customers.push({
      id: 'cust-hold',
      tenantId: TENANT_ID,
      shopifyCustomerId: null,
      email: 'hold@test.com',
      displayName: 'Hold Customer',
      phone: null,
      packCreditCents: 0,
      giftCardBalanceCents: 0,
      createdAt: new Date(),
    });

    store.bookings.push({
      id: 'hold-booking',
      tenantId: TENANT_ID,
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      customerId: 'cust-hold',
      startsAt: futureDate(2, 10),
      endsAt: futureDate(2, 11),
      status: 'pending',
      paymentId: 'pay-hold',
      policyId: 'policy-001',
      rescheduleCount: 0,
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    store.packHolds.push({
      id: 'hold-001',
      tenantId: TENANT_ID,
      customerId: 'cust-hold',
      bookingId: 'hold-booking',
      amountCents: 5000,
      status: 'held',
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    await handleExpirePending(ctx);
    expect(store.packHolds[0]!.status).toBe('released');
    expect(store.customers.find((c) => c.id === 'cust-hold')!.packCreditCents).toBe(5000);
  });
});

describe('Email scheduling cron', () => {
  it('processes pending emails', async () => {
    const ctx = createTestContext(store, deps);

    store.customers.push({
      id: 'cust-email',
      tenantId: TENANT_ID,
      shopifyCustomerId: null,
      email: 'email@test.com',
      displayName: 'Email Customer',
      phone: null,
      packCreditCents: 0,
      giftCardBalanceCents: 0,
      createdAt: new Date(),
    });

    store.bookings.push({
      id: 'email-booking',
      tenantId: TENANT_ID,
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      customerId: 'cust-email',
      startsAt: futureDate(2, 10),
      endsAt: futureDate(2, 11),
      status: 'confirmed',
      paymentId: 'pay-email',
      policyId: 'policy-001',
      rescheduleCount: 0,
      createdAt: new Date(),
    });

    store.scheduledEmails.push({
      id: 'se-001',
      tenantId: TENANT_ID,
      bookingId: 'email-booking',
      type: 'booking_confirmation',
      scheduledAt: new Date(Date.now() - 1000),
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      sentAt: null,
      createdAt: new Date(),
    });

    const result = await handleProcessEmails(ctx);
    expect(body(result).sent).toBe(1);
    expect(deps.email.sentEmails).toHaveLength(1);
    expect(deps.email.sentEmails[0]!.to).toBe('email@test.com');
  });
});

describe('Cancel booking', () => {
  it('cancels and refunds within free window', async () => {
    const ctx = createTestContext(store, deps);

    const startsAt = futureDate(3, 10);
    await handleCreateBooking(ctx, {
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      startsAt: startsAt.toISOString(),
      customer: { name: 'Alice', email: 'alice@test.com' },
    });

    const booking = store.bookings[0]!;
    const payment = store.payments[0]!;

    await store.updateBookingStatus(TENANT_ID, booking.id, 'confirmed');
    await store.updatePaymentStatus(TENANT_ID, payment.id, 'succeeded');

    const token = deps.auth.generateManageBookingToken(booking.id, booking.customerId, 7 * 24 * 60 * 60 * 1000);

    const result = await handleCancelBooking(ctx, {
      bookingId: booking.id,
      token,
      reason: 'changed plans',
    });

    expect(result.status).toBe(200);
    expect(body(result).cancelled).toBe(true);
    const refund = body(result).refund as Record<string, number>;
    expect(refund.toCard).toBeGreaterThan(0);
    expect(store.bookings[0]!.status).toBe('cancelled');
    expect(store.refunds).toHaveLength(1);
    expect(store.scheduledEmails.some((e) => e.type === 'booking_cancellation')).toBe(true);
  });

  it('rejects cancel on already-cancelled booking', async () => {
    const ctx = createTestContext(store, deps);

    store.bookings.push({
      id: 'cancelled-booking',
      tenantId: TENANT_ID,
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      customerId: 'cust-001',
      startsAt: futureDate(2, 10),
      endsAt: futureDate(2, 11),
      status: 'cancelled',
      paymentId: 'pay-001',
      policyId: 'policy-001',
      rescheduleCount: 0,
      createdAt: new Date(),
    });

    const token = deps.auth.generateManageBookingToken('cancelled-booking', 'cust-001', 7 * 24 * 60 * 60 * 1000);
    const result = await handleCancelBooking(ctx, {
      bookingId: 'cancelled-booking',
      token,
    });
    expect(result.status).toBe(400);
    expect(body(result).error).toBe('ALREADY_CANCELLED');
  });
});

describe('Reschedule booking', () => {
  it('performs atomic slot swap', async () => {
    const ctx = createTestContext(store, deps);

    store.bookings.push({
      id: 'resc-booking',
      tenantId: TENANT_ID,
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      customerId: 'cust-001',
      startsAt: futureDate(3, 10),
      endsAt: futureDate(3, 11),
      status: 'confirmed',
      paymentId: 'pay-001',
      policyId: 'policy-001',
      rescheduleCount: 0,
      createdAt: new Date(),
    });

    const newStartsAt = futureDate(4, 14);
    const token = deps.auth.generateManageBookingToken('resc-booking', 'cust-001', 7 * 24 * 60 * 60 * 1000);

    const result = await handleRescheduleBooking(ctx, {
      bookingId: 'resc-booking',
      token,
      newStartsAt: newStartsAt.toISOString(),
      newRoomId: 'room-001',
    });

    expect(result.status).toBe(200);
    const bookingResp = body(result).booking as Record<string, unknown>;
    expect(bookingResp.rescheduleCount).toBe(1);
    expect(store.bookings[0]!.rescheduleCount).toBe(1);
  });

  it('blocks reschedule when max reached', async () => {
    const ctx = createTestContext(store, deps);

    store.bookings.push({
      id: 'max-resc',
      tenantId: TENANT_ID,
      serviceId: 'svc-001',
      resourceId: 'res-001',
      roomId: 'room-001',
      customerId: 'cust-001',
      startsAt: futureDate(3, 10),
      endsAt: futureDate(3, 11),
      status: 'confirmed',
      paymentId: 'pay-001',
      policyId: 'policy-001',
      rescheduleCount: 2,
      createdAt: new Date(),
    });

    const token = deps.auth.generateManageBookingToken('max-resc', 'cust-001', 7 * 24 * 60 * 60 * 1000);
    const result = await handleRescheduleBooking(ctx, {
      bookingId: 'max-resc',
      token,
      newStartsAt: futureDate(4, 14).toISOString(),
      newRoomId: 'room-001',
    });

    expect(result.status).toBe(400);
    expect(body(result).error).toBe('RESCHEDULE_BLOCKED');
  });
});

describe('Magic-link auth', () => {
  it('sends magic link and verifies token', async () => {
    const ctx = createTestContext(store, deps);

    const sendResult = await handleMagicLink(ctx, {
      email: 'alice@test.com',
      returnTo: '/checkout',
    });
    expect(sendResult.status).toBe(200);
    expect(body(sendResult).sent).toBe(true);
    expect(deps.auth.sentLinks).toHaveLength(1);

    const token = (await deps.auth.sendMagicLink({
      email: 'alice@test.com',
      tenantId: TENANT_ID,
      returnTo: '/checkout',
    })).token!;

    const verifyResult = await handleVerify(ctx, { token });
    expect(verifyResult.status).toBe(200);
    expect(verifyResult.body.verified).toBe(true);
    expect(verifyResult.session?.email).toBe('alice@test.com');
  });

  it('rate-limits magic link requests', async () => {
    const ctx = createTestContext(store, deps);

    for (let i = 0; i < 3; i++) {
      await handleMagicLink(ctx, { email: 'rate@test.com', returnTo: '/checkout' });
    }

    const result = await handleMagicLink(ctx, { email: 'rate@test.com', returnTo: '/checkout' });
    expect(result.status).toBe(429);
    expect(body(result).error).toBe('RATE_LIMITED');
  });
});

describe('Customer balance', () => {
  it('returns balance from Shopify', async () => {
    const ctx = createTestContext(store, deps);

    deps.shopify.addCustomer('alice@test.com', 10000, 5000);

    const result = await handleGetBalance(ctx, { email: 'alice@test.com' });
    expect(result.status).toBe(200);
    expect(body(result).packCreditCents).toBe(10000);
    expect(body(result).giftCardBalanceCents).toBe(5000);
  });

  it('falls back to local balance on Shopify error', async () => {
    const ctx = createTestContext(store, deps);

    store.customers.push({
      id: 'local-cust',
      tenantId: TENANT_ID,
      shopifyCustomerId: null,
      email: 'local@test.com',
      displayName: 'Local Customer',
      phone: null,
      packCreditCents: 3000,
      giftCardBalanceCents: 1000,
      createdAt: new Date(),
    });

    const result = await handleGetBalance(ctx, { email: 'local@test.com' });
    expect(result.status).toBe(200);
    expect(body(result).packCreditCents).toBe(3000);
  });
});

describe('Tenant resolution', () => {
  it('resolves known hostnames', async () => {
    const { resolveTenantId } = await import('../lib/tenant.js');
    expect(resolveTenantId('book.littlebiceps.com')).toBe('lb-tenant-001');
    expect(resolveTenantId('littlebiceps.zedslot.com')).toBe('lb-tenant-001');
    expect(resolveTenantId('localhost:3001')).toBe('lb-tenant-001');
  });

  it('returns null for unknown hostnames', async () => {
    const { resolveTenantId } = await import('../lib/tenant.js');
    expect(resolveTenantId('unknown.com')).toBeNull();
  });
});
