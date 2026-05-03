import type { SplitPaymentBreakdown } from '@zedslot/domain';

/**
 * Calculate how to split a booking total across credit sources.
 * Order: pack credit first, then gift card, then card for remainder.
 * All amounts in cents (integers). No float math.
 */
export function calculateSplitPayment(
  totalCents: number,
  packCreditCents: number,
  giftCardCents: number,
  currency: string,
): SplitPaymentBreakdown {
  if (totalCents <= 0) {
    return { totalCents: 0, packCreditCents: 0, giftCardCents: 0, cardCents: 0, currency };
  }

  let remaining = totalCents;

  const packUsed = Math.min(packCreditCents, remaining);
  remaining -= packUsed;

  const giftUsed = Math.min(giftCardCents, remaining);
  remaining -= giftUsed;

  const cardUsed = remaining;

  return {
    totalCents,
    packCreditCents: packUsed,
    giftCardCents: giftUsed,
    cardCents: cardUsed,
    currency,
  };
}
