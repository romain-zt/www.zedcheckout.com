import type { RequestContext } from '../context.js';

interface BookingStatusQuery {
  bookingId: string;
}

export async function handleGetBookingStatus(ctx: RequestContext, query: BookingStatusQuery) {
  const booking = await ctx.store.getBooking(ctx.tenantId, query.bookingId);
  if (!booking) {
    return { status: 404, body: { error: 'NOT_FOUND', message: 'Booking not found' } };
  }

  const service = await ctx.store.getService(ctx.tenantId, booking.serviceId);
  const resources = booking.resourceId
    ? await ctx.store.listResources(ctx.tenantId, [booking.resourceId])
    : [];

  return {
    status: 200,
    body: {
      id: booking.id,
      status: booking.status,
      serviceId: booking.serviceId,
      serviceName: service?.name ?? null,
      resourceId: booking.resourceId,
      resourceName: resources[0]?.name ?? null,
      startsAt: booking.startsAt.toISOString(),
      endsAt: booking.endsAt.toISOString(),
      createdAt: booking.createdAt.toISOString(),
    },
  };
}
