import { describe, it, expect } from 'vitest';
import { BookingConflictError, handleExclusionViolation } from '../errors/index.js';

describe('BookingConflictError', () => {
  it('has correct code and dimension for room conflicts', () => {
    const err = new BookingConflictError('room');
    expect(err.code).toBe('BOOKING_CONFLICT');
    expect(err.dimension).toBe('room');
    expect(err.message).toBe('Booking conflict on room');
    expect(err.name).toBe('BookingConflictError');
  });

  it('has correct code and dimension for resource conflicts', () => {
    const err = new BookingConflictError('resource');
    expect(err.code).toBe('BOOKING_CONFLICT');
    expect(err.dimension).toBe('resource');
    expect(err.message).toBe('Booking conflict on resource');
  });
});

describe('handleExclusionViolation', () => {
  it('throws BookingConflictError for room exclusion (23P01)', () => {
    const pgError = { code: '23P01', constraint_name: 'no_room_overlap' };

    expect(() => handleExclusionViolation(pgError)).toThrow(BookingConflictError);
    try {
      handleExclusionViolation(pgError);
    } catch (e) {
      expect(e).toBeInstanceOf(BookingConflictError);
      expect((e as BookingConflictError).dimension).toBe('room');
    }
  });

  it('throws BookingConflictError for resource exclusion (23P01)', () => {
    const pgError = { code: '23P01', constraint_name: 'no_resource_overlap' };

    try {
      handleExclusionViolation(pgError);
    } catch (e) {
      expect(e).toBeInstanceOf(BookingConflictError);
      expect((e as BookingConflictError).dimension).toBe('resource');
    }
  });

  it('re-throws non-exclusion errors', () => {
    const otherError = new Error('Something else');
    expect(() => handleExclusionViolation(otherError)).toThrow('Something else');
  });

  it('re-throws non-postgres errors', () => {
    const stringError = 'random error';
    expect(() => handleExclusionViolation(stringError)).toThrow();
  });

  it('re-throws postgres errors with different codes', () => {
    const pgError = { code: '23505', constraint_name: 'some_unique' };
    expect(() => handleExclusionViolation(pgError)).toThrow();
    try {
      handleExclusionViolation(pgError);
    } catch (e) {
      expect(e).not.toBeInstanceOf(BookingConflictError);
    }
  });
});

describe('DrizzleBookingStore (structural contract)', () => {
  it('exports DrizzleBookingStore class', async () => {
    const mod = await import('../drizzle-booking-store.js');
    expect(mod.DrizzleBookingStore).toBeDefined();
    expect(typeof mod.DrizzleBookingStore).toBe('function');
  });

  it('exports createDatabase factory', async () => {
    const mod = await import('../client.js');
    expect(mod.createDatabase).toBeDefined();
    expect(typeof mod.createDatabase).toBe('function');
  });

  it('DrizzleBookingStore has all BookingStore methods', async () => {
    const { DrizzleBookingStore } = await import('../drizzle-booking-store.js');
    const proto = DrizzleBookingStore.prototype;

    const expectedMethods = [
      'listActiveServices',
      'getService',
      'listResources',
      'listRooms',
      'listAvailabilityRules',
      'listBookings',
      'getBooking',
      'createBooking',
      'updateBookingStatus',
      'updateBookingSlot',
      'findPendingBooking',
      'listExpiredPendingBookings',
      'getCustomerByEmail',
      'upsertCustomer',
      'updateCustomerPackCredit',
      'getPayment',
      'getPaymentByStripeId',
      'createPayment',
      'updatePaymentStatus',
      'getGlobalPolicy',
      'createPackHold',
      'getPackHoldByBooking',
      'updatePackHoldStatus',
      'listExpiredPackHolds',
      'createRefund',
      'getRefundByBooking',
      'createScheduledEmail',
      'listPendingEmails',
      'updateEmailStatus',
      'incrementEmailAttempts',
      'deletePendingReminder',
    ];

    for (const method of expectedMethods) {
      expect(typeof proto[method as keyof typeof proto]).toBe('function');
    }
  });
});
