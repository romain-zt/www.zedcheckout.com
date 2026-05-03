import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { splitRefund } from '../src/refund.js';
import type { Payment } from '@zedslot/domain';

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'pay-1',
    tenantId: 'tenant-1',
    bookingId: 'booking-1',
    stripePaymentIntentId: 'pi_test',
    paidByCardCents: 8000,
    paidByPackCents: 6000,
    paidByGiftCardCents: 0,
    totalCents: 14000,
    currency: 'eur',
    status: 'succeeded',
    idempotencyKey: 'key-1',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('splitRefund', () => {
  it('full refund preserves proportions', () => {
    const payment = makePayment({
      paidByCardCents: 8000,
      paidByPackCents: 6000,
      paidByGiftCardCents: 0,
      totalCents: 14000,
    });
    const result = splitRefund(payment, 14000);
    expect(result.refundToCardCents + result.refundToPackCents + result.refundToGiftCardCents).toBe(14000);
    expect(result.refundToCardCents).toBe(8000);
    expect(result.refundToPackCents).toBe(6000);
  });

  it('partial refund maintains ratio', () => {
    const payment = makePayment({
      paidByCardCents: 6000,
      paidByPackCents: 4000,
      paidByGiftCardCents: 0,
      totalCents: 10000,
    });
    const result = splitRefund(payment, 5000);
    expect(result.refundToCardCents + result.refundToPackCents + result.refundToGiftCardCents).toBe(5000);
  });

  it('caps refund at total paid', () => {
    const payment = makePayment({ totalCents: 5000 });
    const result = splitRefund(payment, 10000);
    expect(result.refundToCardCents + result.refundToPackCents + result.refundToGiftCardCents).toBe(5000);
  });

  it('handles zero refund', () => {
    const payment = makePayment();
    const result = splitRefund(payment, 0);
    expect(result.refundToCardCents).toBe(0);
    expect(result.refundToPackCents).toBe(0);
    expect(result.refundToGiftCardCents).toBe(0);
  });

  it('property: refund split always sums to requested amount (capped)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 1, max: 200000 }),
        (card, pack, gift, refundAmount) => {
          const total = card + pack + gift;
          if (total <= 0) return;

          const payment = makePayment({
            paidByCardCents: card,
            paidByPackCents: pack,
            paidByGiftCardCents: gift,
            totalCents: total,
          });
          const result = splitRefund(payment, refundAmount);
          const actualRefund = Math.min(refundAmount, total);
          expect(
            result.refundToCardCents + result.refundToPackCents + result.refundToGiftCardCents,
          ).toBe(actualRefund);
        },
      ),
    );
  });

  it('property: refund never exceeds original source amounts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 1, max: 200000 }),
        (card, pack, gift, refundAmount) => {
          const total = card + pack + gift;
          if (total <= 0) return;

          const payment = makePayment({
            paidByCardCents: card,
            paidByPackCents: pack,
            paidByGiftCardCents: gift,
            totalCents: total,
          });
          const result = splitRefund(payment, refundAmount);
          expect(result.refundToCardCents).toBeLessThanOrEqual(card);
          expect(result.refundToPackCents).toBeLessThanOrEqual(pack);
        },
      ),
    );
  });
});
