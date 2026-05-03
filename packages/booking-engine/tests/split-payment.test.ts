import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateSplitPayment } from '../src/split-payment';

describe('calculateSplitPayment', () => {
  it('uses pack credit first, then gift card, then card', () => {
    const result = calculateSplitPayment(10000, 3000, 2000, 'eur');
    expect(result).toEqual({
      totalCents: 10000,
      packCreditCents: 3000,
      giftCardCents: 2000,
      cardCents: 5000,
      currency: 'eur',
    });
  });

  it('handles credit covering full amount', () => {
    const result = calculateSplitPayment(5000, 10000, 0, 'eur');
    expect(result).toEqual({
      totalCents: 5000,
      packCreditCents: 5000,
      giftCardCents: 0,
      cardCents: 0,
      currency: 'eur',
    });
  });

  it('handles zero total', () => {
    const result = calculateSplitPayment(0, 5000, 5000, 'eur');
    expect(result.totalCents).toBe(0);
    expect(result.cardCents).toBe(0);
  });

  it('property: split always sums to total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        (total, pack, gift) => {
          const result = calculateSplitPayment(total, pack, gift, 'eur');
          expect(result.packCreditCents + result.giftCardCents + result.cardCents).toBe(
            result.totalCents,
          );
        },
      ),
    );
  });

  it('property: never uses more credit than available', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        (total, pack, gift) => {
          const result = calculateSplitPayment(total, pack, gift, 'eur');
          expect(result.packCreditCents).toBeLessThanOrEqual(pack);
          expect(result.giftCardCents).toBeLessThanOrEqual(gift);
          expect(result.cardCents).toBeGreaterThanOrEqual(0);
        },
      ),
    );
  });
});
