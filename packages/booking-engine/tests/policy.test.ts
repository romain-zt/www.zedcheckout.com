import { describe, it, expect } from 'vitest';
import { applyPolicy, canReschedule, formatPolicyText } from '../src/policy.js';
import type { Booking, Policy } from '@zedslot/domain';

const basePolicy: Policy = {
  id: 'pol-1',
  tenantId: 'tenant-1',
  scope: 'global',
  freeCancelHours: 24,
  lateCancelBehavior: 'credit',
  noShowBehavior: 'charged',
  freeRescheduleHours: 24,
  maxReschedules: 2,
  createdAt: new Date(),
};

function makeBooking(startsAt: Date, overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    tenantId: 'tenant-1',
    serviceId: 'svc-1',
    resourceId: 'res-1',
    roomId: 'room-1',
    customerId: 'cust-1',
    startsAt,
    endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
    status: 'confirmed',
    paymentId: 'pay-1',
    policyId: 'pol-1',
    rescheduleCount: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('applyPolicy', () => {
  it('returns FREE_CANCEL when within free window', () => {
    const startsAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h from now
    const result = applyPolicy(makeBooking(startsAt), basePolicy, new Date());
    expect(result.type).toBe('FREE_CANCEL');
  });

  it('returns FREE_CANCEL at exactly the boundary', () => {
    const now = new Date();
    const startsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 24h
    const result = applyPolicy(makeBooking(startsAt), basePolicy, now);
    expect(result.type).toBe('FREE_CANCEL');
  });

  it('returns LATE_CANCEL_CREDIT when past window with credit policy', () => {
    const startsAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12h from now
    const result = applyPolicy(makeBooking(startsAt), basePolicy, new Date());
    expect(result.type).toBe('LATE_CANCEL_CREDIT');
  });

  it('returns LATE_CANCEL_NO_REFUND when past window with none policy', () => {
    const startsAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const result = applyPolicy(
      makeBooking(startsAt),
      { ...basePolicy, lateCancelBehavior: 'none' },
      new Date(),
    );
    expect(result.type).toBe('LATE_CANCEL_NO_REFUND');
  });
});

describe('canReschedule', () => {
  it('allows reschedule within window and under max', () => {
    const startsAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    expect(canReschedule(makeBooking(startsAt), basePolicy, new Date())).toBe(true);
  });

  it('blocks reschedule at max count', () => {
    const startsAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    expect(
      canReschedule(makeBooking(startsAt, { rescheduleCount: 2 }), basePolicy, new Date()),
    ).toBe(false);
  });

  it('blocks reschedule past window', () => {
    const startsAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
    expect(canReschedule(makeBooking(startsAt), basePolicy, new Date())).toBe(false);
  });
});

describe('formatPolicyText', () => {
  it('formats in English', () => {
    const text = formatPolicyText(basePolicy, 'en');
    expect(text).toContain('Free cancellation up to 24h');
    expect(text).toContain('credited to your account');
    expect(text).toContain('Free rescheduling up to 24h');
  });

  it('formats in French', () => {
    const text = formatPolicyText(basePolicy, 'fr');
    expect(text).toContain('Annulation gratuite');
    expect(text).toContain('crédité sur votre compte');
  });
});
