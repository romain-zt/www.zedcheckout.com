import type { RequestContext } from '../context';

const HOLD_DURATION_MS = 15 * 60 * 1000;

/**
 * Cron job: expire pending bookings older than 15 minutes.
 * Runs every 5 minutes via Vercel Cron.
 */
export async function handleExpirePending(ctx: RequestContext) {
  const cutoff = new Date(Date.now() - HOLD_DURATION_MS);

  const expiredBookings = await ctx.store.listExpiredPendingBookings(ctx.tenantId, cutoff);
  let cancelledCount = 0;

  for (const booking of expiredBookings) {
    await ctx.store.updateBookingStatus(ctx.tenantId, booking.id, 'cancelled');
    cancelledCount++;

    // Release any pack holds
    const hold = await ctx.store.getPackHoldByBooking(ctx.tenantId, booking.id);
    if (hold) {
      await ctx.store.updatePackHoldStatus(ctx.tenantId, hold.id, 'released');
      await ctx.store.updateCustomerPackCredit(ctx.tenantId, hold.customerId, hold.amountCents);
    }
  }

  // Also release any expired pack holds not already caught
  const expiredHolds = await ctx.store.listExpiredPackHolds(ctx.tenantId, new Date());
  for (const hold of expiredHolds) {
    await ctx.store.updatePackHoldStatus(ctx.tenantId, hold.id, 'released');
    await ctx.store.updateCustomerPackCredit(ctx.tenantId, hold.customerId, hold.amountCents);

    const booking = await ctx.store.getBooking(ctx.tenantId, hold.bookingId);
    if (booking && booking.status === 'pending') {
      await ctx.store.updateBookingStatus(ctx.tenantId, booking.id, 'cancelled');
      cancelledCount++;
    }
  }

  return {
    status: 200,
    body: { expired: cancelledCount },
  };
}
