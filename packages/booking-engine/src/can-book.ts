import type { Slot, Booking, Service, Result, ConflictReason } from '@zedslot/domain';
import { ok, err } from '@zedslot/domain';
import { hasOverlap } from './list-available-slots';

/**
 * Application-layer pre-check. NOT a safety guarantee — the DB EXCLUDE constraint
 * is the real defense. This is for UX (friendly errors before payment attempt).
 */
export function canBook(
  slot: Slot,
  existingBookings: Booking[],
  service: Service,
): Result<true, ConflictReason> {
  if (service.status === 'disabled') {
    return err({ type: 'SERVICE_DISABLED' });
  }

  const activeBookings = existingBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending',
  );

  const roomConflict = activeBookings.find(
    (b) =>
      b.roomId === slot.roomId &&
      hasOverlap(b.startsAt, b.endsAt, slot.startsAt, slot.endsAt),
  );
  if (roomConflict) {
    return err({ type: 'ROOM_CONFLICT', conflictingBookingId: roomConflict.id });
  }

  if (slot.resourceId) {
    const resourceConflict = activeBookings.find(
      (b) =>
        b.resourceId === slot.resourceId &&
        hasOverlap(b.startsAt, b.endsAt, slot.startsAt, slot.endsAt),
    );
    if (resourceConflict) {
      return err({ type: 'RESOURCE_CONFLICT', conflictingBookingId: resourceConflict.id });
    }
  }

  return ok(true);
}
