export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export type ConflictReason =
  | { type: 'ROOM_CONFLICT'; conflictingBookingId: string }
  | { type: 'RESOURCE_CONFLICT'; conflictingBookingId: string }
  | { type: 'SERVICE_DISABLED' }
  | { type: 'OUTSIDE_AVAILABILITY' };

export type CancellationOutcome =
  | { type: 'FREE_CANCEL' }
  | { type: 'LATE_CANCEL_CREDIT' }
  | { type: 'LATE_CANCEL_NO_REFUND' };
