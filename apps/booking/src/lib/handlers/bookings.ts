import { canBook, assignRoom, calculateSplitPayment } from '@zedslot/booking-engine';
import type { Booking, Payment, Customer, PackHold, Slot } from '@zedslot/domain';
import type { RequestContext } from '../context';
import { newId } from '../id';
import { getTenant } from '../tenant';

const HOLD_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface CreateBookingInput {
  serviceId: string;
  resourceId?: string;
  roomId?: string;
  startsAt: string;
  customer: { name: string; email: string; phone?: string };
  paymentMethod?: 'card' | 'credit' | 'split';
  creditAmountCents?: number;
}

export async function handleCreateBooking(ctx: RequestContext, input: CreateBookingInput) {
  const service = await ctx.store.getService(ctx.tenantId, input.serviceId);
  if (!service) {
    return { status: 404, body: { error: 'NOT_FOUND', message: 'Service not found' } };
  }
  if (service.status === 'disabled') {
    return { status: 400, body: { error: 'SERVICE_DISABLED', message: 'Service is currently unavailable' } };
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);

  // Room assignment: use provided roomId or auto-assign
  let roomId = input.roomId;
  if (!roomId) {
    const eligibleRooms = await ctx.store.listRooms(ctx.tenantId, service.eligibleRoomIds);
    const existingBookings = await ctx.store.listBookings(ctx.tenantId, { status: ['pending', 'confirmed'] });
    const assignedRoomId = assignRoom(eligibleRooms, existingBookings, startsAt, endsAt);
    if (!assignedRoomId) {
      return { status: 409, body: { error: 'NO_ROOM_AVAILABLE', message: 'No room available for this time' } };
    }
    roomId = assignedRoomId;
  }

  const resourceId = input.resourceId ?? null;

  // Idempotency: check for existing pending booking
  const existing = await ctx.store.findPendingBooking(
    ctx.tenantId,
    input.serviceId,
    resourceId,
    roomId,
    startsAt,
    input.customer.email,
  );
  if (existing) {
    const payment = await ctx.store.getPayment(ctx.tenantId, existing.paymentId);
    return {
      status: 200,
      body: {
        bookingId: existing.id,
        paymentIntentClientSecret: payment?.stripePaymentIntentId ? `${payment.stripePaymentIntentId}_secret` : null,
        expiresAt: new Date(existing.createdAt.getTime() + HOLD_DURATION_MS).toISOString(),
      },
    };
  }

  // canBook pre-check
  const slot: Slot = { tenantId: ctx.tenantId, serviceId: service.id, resourceId, roomId, startsAt, endsAt };
  const existingBookings = await ctx.store.listBookings(ctx.tenantId, { status: ['pending', 'confirmed'] });
  const bookable = canBook(slot, existingBookings, service);
  if (!bookable.ok) {
    return buildConflictResponse(ctx, bookable.error, service, existingBookings, startsAt, endsAt);
  }

  // Upsert customer
  let customer = await ctx.store.getCustomerByEmail(ctx.tenantId, input.customer.email);
  if (!customer) {
    customer = await ctx.store.upsertCustomer({
      id: newId(),
      tenantId: ctx.tenantId,
      shopifyCustomerId: null,
      email: input.customer.email,
      displayName: input.customer.name,
      phone: input.customer.phone ?? null,
      packCreditCents: 0,
      giftCardBalanceCents: 0,
      createdAt: new Date(),
    } satisfies Customer);
  }

  // Get policy snapshot
  const policy = await ctx.store.getGlobalPolicy(ctx.tenantId);
  const policyId = policy?.id ?? newId();

  const bookingId = newId();
  const paymentId = newId();

  // Calculate payment split
  const paymentMethod = input.paymentMethod ?? 'card';
  const creditAmountCents = input.creditAmountCents ?? 0;

  let paidByPackCents = 0;
  let paidByCardCents = service.priceCents;
  let paidByGiftCardCents = 0;

  if (paymentMethod === 'credit' || paymentMethod === 'split') {
    const split = calculateSplitPayment(
      service.priceCents,
      Math.min(creditAmountCents, customer.packCreditCents),
      customer.giftCardBalanceCents,
      'eur',
    );
    paidByPackCents = split.packCreditCents;
    paidByGiftCardCents = split.giftCardCents;
    paidByCardCents = split.cardCents;
  }

  // Create payment record
  const payment: Payment = {
    id: paymentId,
    tenantId: ctx.tenantId,
    bookingId,
    stripePaymentIntentId: null,
    paidByCardCents,
    paidByPackCents,
    paidByGiftCardCents,
    totalCents: service.priceCents,
    currency: 'eur',
    status: 'requires_action',
    idempotencyKey: bookingId,
    createdAt: new Date(),
  };
  await ctx.store.createPayment(payment);

  // Create Stripe PaymentIntent if card portion > 0
  let clientSecret: string | null = null;
  if (paidByCardCents > 0) {
    const intent = await ctx.deps.payments.createPaymentIntent({
      amountCents: paidByCardCents,
      currency: 'eur',
      idempotencyKey: bookingId,
      metadata: { bookingId, tenantId: ctx.tenantId },
    });
    clientSecret = intent.clientSecret;
    await ctx.store.updatePaymentStatus(ctx.tenantId, paymentId, 'requires_action', intent.id);
  }

  // If pack credit is used, create pack hold and decrement balance
  if (paidByPackCents > 0) {
    const hold: PackHold = {
      id: newId(),
      tenantId: ctx.tenantId,
      customerId: customer.id,
      bookingId,
      amountCents: paidByPackCents,
      status: 'held',
      expiresAt: new Date(Date.now() + HOLD_DURATION_MS),
      createdAt: new Date(),
    };
    await ctx.store.createPackHold(hold);
    await ctx.store.updateCustomerPackCredit(ctx.tenantId, customer.id, -paidByPackCents);
  }

  // Create booking
  const booking: Booking = {
    id: bookingId,
    tenantId: ctx.tenantId,
    serviceId: service.id,
    resourceId,
    roomId,
    customerId: customer.id,
    startsAt,
    endsAt,
    status: 'pending',
    paymentId,
    policyId,
    rescheduleCount: 0,
    createdAt: new Date(),
  };
  await ctx.store.createBooking(booking);

  // Credit-only payment: confirm immediately (no Stripe charge needed)
  if (paidByCardCents === 0) {
    await ctx.store.updateBookingStatus(ctx.tenantId, bookingId, 'confirmed');
    await ctx.store.updatePaymentStatus(ctx.tenantId, paymentId, 'succeeded');

    const packHold = await ctx.store.getPackHoldByBooking(ctx.tenantId, bookingId);
    if (packHold) {
      await ctx.store.updatePackHoldStatus(ctx.tenantId, packHold.id, 'debited');
    }

    await scheduleConfirmationEmails(ctx, booking);

    return {
      status: 201,
      body: {
        bookingId,
        paymentIntentClientSecret: null,
        expiresAt: null,
        confirmed: true,
      },
    };
  }

  return {
    status: 201,
    body: {
      bookingId,
      paymentIntentClientSecret: clientSecret,
      expiresAt: new Date(Date.now() + HOLD_DURATION_MS).toISOString(),
    },
  };
}

async function buildConflictResponse(
  ctx: RequestContext,
  error: { type: string; conflictingBookingId?: string },
  service: { id: string; durationMinutes: number; eligibleResourceIds: string[]; eligibleRoomIds: string[] },
  existingBookings: Booking[],
  startsAt: Date,
  endsAt: Date,
) {
  // Find next available slot
  const nextAvailable = await findNextAvailableSlot(ctx, service, existingBookings, startsAt);

  return {
    status: 409,
    body: {
      error: 'BOOKING_CONFLICT',
      message: 'That slot was just taken',
      nextAvailable,
    },
  };
}

async function findNextAvailableSlot(
  ctx: RequestContext,
  service: { id: string; durationMinutes: number; eligibleResourceIds: string[]; eligibleRoomIds: string[] },
  existingBookings: Booking[],
  afterTime: Date,
): Promise<{ startsAt: string; endsAt: string; resourceId: string | null; roomId: string } | null> {
  const { listAvailableSlots } = await import('@zedslot/booking-engine');

  const fullService = await ctx.store.getService(ctx.tenantId, service.id);
  if (!fullService) return null;

  const [resources, rooms, rules] = await Promise.all([
    ctx.store.listResources(ctx.tenantId, service.eligibleResourceIds),
    ctx.store.listRooms(ctx.tenantId, service.eligibleRoomIds),
    ctx.store.listAvailabilityRules(ctx.tenantId),
  ]);

  const tenant = getTenant(ctx.tenantId);
  const tz = tenant?.timezone ?? 'Europe/Paris';

  const to = new Date(afterTime.getTime() + 7 * 24 * 60 * 60 * 1000);
  const slots = listAvailableSlots(fullService, { from: afterTime, to }, resources, rooms, existingBookings, rules, tz);

  const next = slots.find((s) => s.startsAt.getTime() > afterTime.getTime());
  if (!next) return null;

  return {
    startsAt: next.startsAt.toISOString(),
    endsAt: next.endsAt.toISOString(),
    resourceId: next.resourceId,
    roomId: next.roomId,
  };
}

async function scheduleConfirmationEmails(ctx: RequestContext, booking: Booking) {
  const confirmationEmail = {
    id: newId(),
    tenantId: ctx.tenantId,
    bookingId: booking.id,
    type: 'booking_confirmation' as const,
    scheduledAt: new Date(),
    status: 'pending' as const,
    attempts: 0,
    lastAttemptAt: null,
    sentAt: null,
    createdAt: new Date(),
  };
  await ctx.store.createScheduledEmail(confirmationEmail);

  // Schedule reminder 24h before booking
  const REMINDER_HOURS = 24;
  const reminderAt = new Date(booking.startsAt.getTime() - REMINDER_HOURS * 60 * 60 * 1000);
  if (reminderAt.getTime() > Date.now()) {
    const reminderEmail = {
      id: newId(),
      tenantId: ctx.tenantId,
      bookingId: booking.id,
      type: 'booking_reminder' as const,
      scheduledAt: reminderAt,
      status: 'pending' as const,
      attempts: 0,
      lastAttemptAt: null,
      sentAt: null,
      createdAt: new Date(),
    };
    await ctx.store.createScheduledEmail(reminderEmail);
  }
}

export { scheduleConfirmationEmails };
