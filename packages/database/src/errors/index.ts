export class BookingConflictError extends Error {
  readonly code = 'BOOKING_CONFLICT' as const;

  constructor(public readonly dimension: 'room' | 'resource') {
    super(`Booking conflict on ${dimension}`);
    this.name = 'BookingConflictError';
  }
}

/**
 * Check if a Postgres error is an exclusion violation (23P01).
 * If so, determine the dimension (room or resource) and throw BookingConflictError.
 */
export function handleExclusionViolation(error: unknown): never {
  if (isPostgresError(error) && error.code === '23P01') {
    const dimension = error.constraint_name?.includes('room') ? 'room' : 'resource';
    throw new BookingConflictError(dimension);
  }
  throw error;
}

function isPostgresError(
  error: unknown,
): error is { code: string; constraint_name?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}
