import type { Payment, RefundAllocation } from '@zedslot/domain';

/**
 * Proportional split of refund matching original payment sources.
 * Last source absorbs rounding remainder — zero loss guaranteed.
 * All amounts in cents (integers). No float math.
 */
export function splitRefund(
  payment: Payment,
  totalToRefundCents: number,
): RefundAllocation {
  if (totalToRefundCents <= 0 || payment.totalCents <= 0) {
    return { refundToCardCents: 0, refundToPackCents: 0, refundToGiftCardCents: 0 };
  }

  const cappedRefund = Math.min(totalToRefundCents, payment.totalCents);

  const refundToCardCents = Math.floor(
    (cappedRefund * payment.paidByCardCents) / payment.totalCents,
  );
  const refundToPackCents = Math.floor(
    (cappedRefund * payment.paidByPackCents) / payment.totalCents,
  );
  const refundToGiftCardCents = cappedRefund - refundToCardCents - refundToPackCents;

  return { refundToCardCents, refundToPackCents, refundToGiftCardCents };
}
