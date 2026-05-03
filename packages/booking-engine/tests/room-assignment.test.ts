import { describe, it, expect } from 'vitest';
import { assignRoom } from '../src/room-assignment';
import type { Room, Booking } from '@zedslot/domain';

const rooms: Room[] = [
  { id: 'room-a', tenantId: 't1', name: 'Room A', bookableWithoutResource: false, status: 'active', createdAt: new Date() },
  { id: 'room-b', tenantId: 't1', name: 'Room B', bookableWithoutResource: false, status: 'active', createdAt: new Date() },
  { id: 'room-c', tenantId: 't1', name: 'Room C', bookableWithoutResource: false, status: 'disabled', createdAt: new Date() },
];

function makeBooking(roomId: string): Booking {
  return {
    id: `b-${roomId}`,
    tenantId: 't1',
    serviceId: 's1',
    resourceId: 'r1',
    roomId,
    customerId: 'c1',
    startsAt: new Date('2026-06-01T09:00:00Z'),
    endsAt: new Date('2026-06-01T10:00:00Z'),
    status: 'confirmed',
    paymentId: 'p1',
    policyId: 'pol-1',
    rescheduleCount: 0,
    createdAt: new Date(),
  };
}

describe('assignRoom', () => {
  it('returns first available room sorted by ID', () => {
    const result = assignRoom(
      rooms,
      [],
      new Date('2026-06-01T09:00:00Z'),
      new Date('2026-06-01T10:00:00Z'),
    );
    expect(result).toBe('room-a');
  });

  it('skips booked rooms', () => {
    const result = assignRoom(
      rooms,
      [makeBooking('room-a')],
      new Date('2026-06-01T09:00:00Z'),
      new Date('2026-06-01T10:00:00Z'),
    );
    expect(result).toBe('room-b');
  });

  it('returns null when all rooms booked', () => {
    const result = assignRoom(
      rooms,
      [makeBooking('room-a'), makeBooking('room-b')],
      new Date('2026-06-01T09:00:00Z'),
      new Date('2026-06-01T10:00:00Z'),
    );
    expect(result).toBeNull();
  });

  it('skips disabled rooms', () => {
    const result = assignRoom(
      rooms,
      [makeBooking('room-a'), makeBooking('room-b')],
      new Date('2026-06-01T09:00:00Z'),
      new Date('2026-06-01T10:00:00Z'),
    );
    expect(result).toBeNull(); // room-c is disabled
  });

  it('returns room when no time overlap', () => {
    const result = assignRoom(
      rooms,
      [makeBooking('room-a')],
      new Date('2026-06-01T10:00:00Z'), // starts when existing ends
      new Date('2026-06-01T11:00:00Z'),
    );
    expect(result).toBe('room-a');
  });
});
