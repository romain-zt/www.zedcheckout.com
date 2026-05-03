import { canBook, canReschedule } from '@zedslot/booking-engine';
import type { Slot } from '@zedslot/domain';
import type { RequestContext } from '../context';
import { newId } from '../id';

interface RescheduleInput {
  bookingId: string;
  token: string;
  newStartsAt: string;
  newResourceId?: string;
  newRoomId: string;
}

export async function handleRescheduleBooking(ctx: RequestContext, input: RescheduleInput) {
  // Verify manage-booking token
  const tokenData = ctx.deps.auth.verifyManageBookingToken(input.token);
  if (!tokenData || tokenData.bookingId !== input.bookingId) {
    return { status: 401, body: { error: 'UNAUTHORIZED', message: 'Invalid or expired token' } };
  }

  const booking = await ctx.store.getBooking(ctx.tenantId, input.bookingId);
  if (!booking) {
    return { status: 404, body: { error: 'NOT_FOUND', message: 'Booking not found' } };
  }

  if (booking.status !== 'confirmed') {
    return { status: 400, body: { error: 'INVALID_STATUS', message: 'Only confirmed bookings can be rescheduled' } };
  }

  const policy = await ctx.store.getGlobalPolicy(ctx.tenantId);
  if (!policy) {
    return { status: 500, body: { error: 'NO_POLICY', message: 'No policy found' } };
  }

  if (!canReschedule(booking, policy, new Date())) {
    const reason = booking.rescheduleCount >= policy.maxReschedules
      ? `Maximum reschedules reached (${policy.maxReschedules})`
      : `Rescheduling window has passed (${policy.freeRescheduleHours}h before booking)`;
    return { status: 400, body: { error: 'RESCHEDULE_BLOCKED', message: reason } };
  }

  const service = await ctx.store.getService(ctx.tenantId, booking.serviceId);
  if (!service) {
    return { status: 500, body: { error: 'SERVICE_NOT_FOUND', message: 'Service not found' } };
  }

  const newStartsAt = new Date(input.newStartsAt);
  const newEndsAt = new Date(newStartsAt.getTime() + service.durationMinutes * 60 * 1000);
  const newResourceId = input.newResourceId ?? booking.resourceId;
  const newRoomId = input.newRoomId;

  const newSlot: Slot = {
    tenantId: ctx.tenantId,
    serviceId: service.id,
    resourceId: newResourceId,
    roomId: newRoomId,
    startsAt: newStartsAt,
    endsAt: newEndsAt,
  };

  // Exclude the current booking from conflict check (we're moving it)
  const existingBookings = await ctx.store.listBookings(ctx.tenantId, { status: ['pending', 'confirmed'] });
  const otherBookings = existingBookings.filter((b) => b.id !== booking.id);

  const bookable = canBook(newSlot, otherBookings, service);
  if (!bookable.ok) {
    return {
      status: 409,
      body: {
        error: 'BOOKING_CONFLICT',
        message: 'That slot was just taken',
        nextAvailable: null,
      },
    };
  }

  // Atomic slot swap
  const updated = await ctx.store.updateBookingSlot(ctx.tenantId, booking.id, {
    startsAt: newStartsAt,
    endsAt: newEndsAt,
    resourceId: newResourceId,
    roomId: newRoomId,
    rescheduleCount: booking.rescheduleCount + 1,
  });

  if (!updated) {
    return { status: 500, body: { error: 'UPDATE_FAILED', message: 'Failed to update booking' } };
  }

  // Delete old reminder, schedule new emails
  await ctx.store.deletePendingReminder(ctx.tenantId, booking.id);

  await ctx.store.createScheduledEmail({
    id: newId(),
    tenantId: ctx.tenantId,
    bookingId: booking.id,
    type: 'booking_confirmation',
    scheduledAt: new Date(),
    status: 'pending',
    attempts: 0,
    lastAttemptAt: null,
    sentAt: null,
    createdAt: new Date(),
  });

  const REMINDER_HOURS = 24;
  const reminderAt = new Date(newStartsAt.getTime() - REMINDER_HOURS * 60 * 60 * 1000);
  if (reminderAt.getTime() > Date.now()) {
    await ctx.store.createScheduledEmail({
      id: newId(),
      tenantId: ctx.tenantId,
      bookingId: booking.id,
      type: 'booking_reminder',
      scheduledAt: reminderAt,
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      sentAt: null,
      createdAt: new Date(),
    });
  }

  return {
    status: 200,
    body: {
      booking: {
        id: updated.id,
        serviceId: updated.serviceId,
        resourceId: updated.resourceId,
        roomId: updated.roomId,
        startsAt: updated.startsAt.toISOString(),
        endsAt: updated.endsAt.toISOString(),
        status: updated.status,
        rescheduleCount: updated.rescheduleCount,
      },
    },
  };
}
