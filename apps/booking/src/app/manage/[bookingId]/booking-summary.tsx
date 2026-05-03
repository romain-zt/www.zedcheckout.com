'use client';

import type { ManageBookingData } from './types';

interface Props {
  booking: ManageBookingData['booking'];
}

export function BookingSummary({ booking }: Props) {
  const serviceName = booking.serviceName.en || booking.serviceName.fr;
  const startsAt = new Date(booking.startsAt);

  const dateStr = startsAt.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const timeStr = startsAt.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusLabel = STATUS_LABELS[booking.status];
  const statusClass = STATUS_CLASSES[booking.status];

  return (
    <div className="rounded-xl border border-navy/10 bg-white shadow-sm">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-navy sm:text-lg">{serviceName}</h2>
          <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          {booking.resourceName && (
            <div className="flex items-center gap-2">
              <dt className="text-navy/60">Practitioner</dt>
              <dd className="font-medium text-navy">{booking.resourceName}</dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <dt className="text-navy/60">Date</dt>
            <dd className="font-medium text-navy">{dateStr}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-navy/60">Time</dt>
            <dd className="font-medium text-navy">{timeStr}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-navy/60">Duration</dt>
            <dd className="font-medium text-navy">{booking.durationMinutes} min</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
};

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-navy/10 text-navy',
  no_show: 'bg-red-100 text-red-800',
};
