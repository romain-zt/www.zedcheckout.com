import { describe, it, expect } from 'vitest';
import { canBook } from '../src/can-book';
import type { Slot, Booking, Service } from '@zedslot/domain';

const baseService: Service = {
  id: 'svc-1',
  tenantId: 'tenant-1',
  name: { fr: 'Drainage', en: 'Drainage' },
  description: null,
  durationMinutes: 60,
  priceCents: 8000,
  eligibleResourceIds: ['res-1'],
  eligibleRoomIds: ['room-1'],
  requiresResource: true,
  requiresRoom: true,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseSlot: Slot = {
  tenantId: 'tenant-1',
  serviceId: 'svc-1',
  resourceId: 'res-1',
  roomId: 'room-1',
  startsAt: new Date('2026-06-01T09:00:00Z'),
  endsAt: new Date('2026-06-01T10:00:00Z'),
};

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    tenantId: 'tenant-1',
    serviceId: 'svc-1',
    resourceId: 'res-1',
    roomId: 'room-1',
    customerId: 'cust-1',
    startsAt: new Date('2026-06-01T09:00:00Z'),
    endsAt: new Date('2026-06-01T10:00:00Z'),
    status: 'confirmed',
    paymentId: 'pay-1',
    policyId: 'pol-1',
    rescheduleCount: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('canBook', () => {
  it('returns ok when no conflicts', () => {
    const result = canBook(baseSlot, [], baseService);
    expect(result.ok).toBe(true);
  });

  it('returns ROOM_CONFLICT when room overlaps', () => {
    const existing = [makeBooking({ resourceId: 'res-2' })]; // different resource, same room
    const result = canBook(baseSlot, existing, baseService);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('ROOM_CONFLICT');
    }
  });

  it('returns RESOURCE_CONFLICT when resource overlaps', () => {
    const existing = [makeBooking({ roomId: 'room-2' })]; // different room, same resource
    const result = canBook(baseSlot, existing, baseService);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('RESOURCE_CONFLICT');
    }
  });

  it('returns SERVICE_DISABLED when service is disabled', () => {
    const result = canBook(baseSlot, [], { ...baseService, status: 'disabled' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('SERVICE_DISABLED');
    }
  });

  it('ignores cancelled bookings', () => {
    const existing = [makeBooking({ status: 'cancelled' })];
    const result = canBook(baseSlot, existing, baseService);
    expect(result.ok).toBe(true);
  });

  it('detects pending booking conflicts', () => {
    const existing = [makeBooking({ status: 'pending' })];
    const result = canBook(baseSlot, existing, baseService);
    expect(result.ok).toBe(false);
  });

  it('no conflict when times do not overlap', () => {
    const existing = [
      makeBooking({ startsAt: new Date('2026-06-01T10:00:00Z'), endsAt: new Date('2026-06-01T11:00:00Z') }),
    ];
    const result = canBook(baseSlot, existing, baseService);
    expect(result.ok).toBe(true);
  });

  it('allows null resourceId (room-only) with no resource conflict check', () => {
    const roomOnlySlot: Slot = { ...baseSlot, resourceId: null };
    const existing = [makeBooking({ roomId: 'room-2' })]; // different room
    const result = canBook(roomOnlySlot, existing, { ...baseService, requiresResource: false });
    expect(result.ok).toBe(true);
  });
});
