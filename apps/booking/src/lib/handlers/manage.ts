import { applyPolicy, canReschedule } from '@zedslot/booking-engine';
import type { RequestContext } from '../context.js';

interface ManageQuery {
  bookingId: string;
  token: string;
}

export async function handleGetManageBooking(ctx: RequestContext, query: ManageQuery) {
  const tokenData = ctx.deps.auth.verifyManageBookingToken(query.token);
  if (!tokenData || tokenData.bookingId !== query.bookingId) {
    return { status: 401, body: { error: 'UNAUTHORIZED', message: 'Invalid or expired token' } };
  }

  const booking = await ctx.store.getBooking(ctx.tenantId, query.bookingId);
  if (!booking) {
    return { status: 404, body: { error: 'NOT_FOUND', message: 'Booking not found' } };
  }

  const [service, resource, policy] = await Promise.all([
    ctx.store.getService(ctx.tenantId, booking.serviceId),
    booking.resourceId
      ? ctx.store.listResources(ctx.tenantId, [booking.resourceId]).then((r) => r[0] ?? null)
      : Promise.resolve(null),
    ctx.store.getGlobalPolicy(ctx.tenantId),
  ]);

  if (!service) {
    return { status: 500, body: { error: 'SERVICE_NOT_FOUND', message: 'Service not found' } };
  }

  if (!policy) {
    return { status: 500, body: { error: 'NO_POLICY', message: 'No policy found' } };
  }

  const now = new Date();
  let canCancelBooking = false;
  let cancelOutcome: 'full_refund' | 'credit_refund' | 'no_refund' = 'no_refund';
  let canRescheduleBooking = false;
  let rescheduleBlockedReason: string | undefined;

  if (booking.status === 'confirmed') {
    canCancelBooking = true;
    const outcome = applyPolicy(booking, policy, now);
    if (outcome.type === 'FREE_CANCEL') {
      cancelOutcome = 'full_refund';
    } else if (outcome.type === 'LATE_CANCEL_CREDIT') {
      cancelOutcome = 'credit_refund';
    } else {
      cancelOutcome = 'no_refund';
    }

    canRescheduleBooking = canReschedule(booking, policy, now);
    if (!canRescheduleBooking) {
      if (booking.rescheduleCount >= policy.maxReschedules) {
        rescheduleBlockedReason = `Maximum reschedules reached (${policy.maxReschedules})`;
      } else {
        rescheduleBlockedReason = `Rescheduling window has passed (${policy.freeRescheduleHours}h before booking)`;
      }
    }
  }

  return {
    status: 200,
    body: {
      booking: {
        id: booking.id,
        serviceId: booking.serviceId,
        serviceName: service.name,
        resourceId: booking.resourceId,
        resourceName: resource?.name ?? null,
        roomId: booking.roomId,
        startsAt: booking.startsAt.toISOString(),
        endsAt: booking.endsAt.toISOString(),
        status: booking.status,
        rescheduleCount: booking.rescheduleCount,
        durationMinutes: service.durationMinutes,
        priceCents: service.priceCents,
      },
      policy: {
        freeCancelHours: policy.freeCancelHours,
        freeRescheduleHours: policy.freeRescheduleHours,
        maxReschedules: policy.maxReschedules,
        lateCancelBehavior: policy.lateCancelBehavior,
      },
      actions: {
        canCancel: canCancelBooking,
        cancelOutcome,
        canReschedule: canRescheduleBooking,
        rescheduleBlockedReason,
      },
    },
  };
}
