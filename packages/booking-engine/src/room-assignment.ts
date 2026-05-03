import type { Room, Booking } from '@zedslot/domain';
import { hasOverlap } from './list-available-slots';

/**
 * Auto-assign a room: first eligible room (sorted by ID) with no overlap.
 * Deterministic: same inputs → same room.
 */
export function assignRoom(
  eligibleRooms: Room[],
  existingBookings: Booking[],
  startsAt: Date,
  endsAt: Date,
): string | null {
  const activeBookings = existingBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending',
  );

  const sorted = [...eligibleRooms]
    .filter((r) => r.status === 'active')
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const room of sorted) {
    const conflict = activeBookings.some(
      (b) =>
        b.roomId === room.id &&
        hasOverlap(b.startsAt, b.endsAt, startsAt, endsAt),
    );
    if (!conflict) return room.id;
  }

  return null;
}
