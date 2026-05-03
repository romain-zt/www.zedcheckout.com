import { applyPolicy, splitRefund } from '@zedslot/booking-engine';
import type { Refund } from '@zedslot/domain';
import type { RequestContext } from '../context.js';
import { newId } from '../id.js';

interface CancelInput {
  bookingId: string;
  token: string;
  reason?: string;
}

export async function handleCancelBooking(ctx: RequestContext, input: CancelInput) {
  // Verify manage-booking token
  const tokenData = ctx.deps.auth.verifyManageBookingToken(input.token);
  if (!tokenData || tokenData.bookingId !== input.bookingId) {
    return { status: 401, body: { error: 'UNAUTHORIZED', message: 'Invalid or expired token' } };
  }

  const booking = await ctx.store.getBooking(ctx.tenantId, input.bookingId);
  if (!booking) {
    return { status: 404, body: { error: 'NOT_FOUND', message: 'Booking not found' } };
  }

  if (booking.status === 'cancelled') {
    return { status: 400, body: { error: 'ALREADY_CANCELLED', message: 'Booking already cancelled' } };
  }

  if (booking.status === 'completed') {
    return { status: 400, body: { error: 'CANNOT_CANCEL', message: 'Cannot cancel a completed booking' } };
  }

  const policy = await ctx.store.getGlobalPolicy(ctx.tenantId);
  if (!policy) {
    return { status: 500, body: { error: 'NO_POLICY', message: 'No cancellation policy found' } };
  }

  const outcome = applyPolicy(booking, policy, new Date());
  const payment = await ctx.store.getPayment(ctx.tenantId, booking.paymentId);
  if (!payment) {
    return { status: 500, body: { error: 'PAYMENT_NOT_FOUND', message: 'Payment record not found' } };
  }

  let refundAllocation = { refundToCardCents: 0, refundToPackCents: 0, refundToGiftCardCents: 0 };

  if (outcome.type === 'FREE_CANCEL') {
    refundAllocation = splitRefund(payment, payment.totalCents);
  } else if (outcome.type === 'LATE_CANCEL_CREDIT') {
    // Late cancel: card portion becomes pack credit
    refundAllocation = {
      refundToCardCents: 0,
      refundToPackCents: payment.totalCents,
      refundToGiftCardCents: 0,
    };
  }
  // LATE_CANCEL_NO_REFUND: refundAllocation stays zero

  // Create refund record
  const totalRefundCents = refundAllocation.refundToCardCents + refundAllocation.refundToPackCents + refundAllocation.refundToGiftCardCents;

  if (totalRefundCents > 0) {
    const refund: Refund = {
      id: newId(),
      tenantId: ctx.tenantId,
      paymentId: payment.id,
      bookingId: booking.id,
      refundedToCardCents: refundAllocation.refundToCardCents,
      refundedToPackCents: refundAllocation.refundToPackCents,
      refundedToGiftCardCents: refundAllocation.refundToGiftCardCents,
      totalCents: totalRefundCents,
      reason: input.reason ?? 'customer_cancellation',
      status: 'pending',
      requestedAt: new Date(),
      completedAt: null,
    };
    await ctx.store.createRefund(refund);

    // Stripe refund for card portion
    if (refundAllocation.refundToCardCents > 0 && payment.stripePaymentIntentId) {
      try {
        await ctx.deps.payments.createRefund({
          paymentIntentId: payment.stripePaymentIntentId,
          amountCents: refundAllocation.refundToCardCents,
          idempotencyKey: refund.id,
          reason: 'requested_by_customer',
        });
      } catch {
        // Stripe refund queued for retry; booking is still cancelled
      }
    }

    // Pack credit restore
    if (refundAllocation.refundToPackCents > 0) {
      const customer = booking.customerId;
      await ctx.store.updateCustomerPackCredit(ctx.tenantId, customer, refundAllocation.refundToPackCents);
    }
  }

  // Cancel booking
  await ctx.store.updateBookingStatus(ctx.tenantId, booking.id, 'cancelled');

  // Schedule cancellation email + delete pending reminder
  await ctx.store.createScheduledEmail({
    id: newId(),
    tenantId: ctx.tenantId,
    bookingId: booking.id,
    type: 'booking_cancellation',
    scheduledAt: new Date(),
    status: 'pending',
    attempts: 0,
    lastAttemptAt: null,
    sentAt: null,
    createdAt: new Date(),
  });
  await ctx.store.deletePendingReminder(ctx.tenantId, booking.id);

  return {
    status: 200,
    body: {
      cancelled: true,
      refund: {
        toCard: refundAllocation.refundToCardCents,
        toPack: refundAllocation.refundToPackCents,
        toGiftCard: refundAllocation.refundToGiftCardCents,
      },
    },
  };
}
