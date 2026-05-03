'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ManageBookingData, SlotOption } from './types';

interface Props {
  bookingId: string;
  token: string;
  booking: ManageBookingData['booking'];
  policy: ManageBookingData['policy'];
  canReschedule: boolean;
  blockedReason?: string;
  onRescheduled: () => void;
}

export function RescheduleSection({
  bookingId,
  token,
  booking,
  policy,
  canReschedule,
  blockedReason,
  onRescheduled,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]!;
  });

  const remainingReschedules = policy.maxReschedules - booking.rescheduleCount;

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const from = new Date(date);
      from.setHours(0, 0, 0, 0);
      const to = new Date(date);
      to.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/slots?serviceId=${booking.serviceId}&from=${from.toISOString()}&to=${to.toISOString()}`,
      );
      if (res.ok) {
        const body = await res.json();
        setSlots(body.slots ?? []);
      }
    } catch {
      // User sees empty slot list
    } finally {
      setLoadingSlots(false);
    }
  }, [booking.serviceId]);

  useEffect(() => {
    if (expanded && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [expanded, selectedDate, fetchSlots]);

  const handleReschedule = useCallback(async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newStartsAt: selectedSlot.startsAt,
          newRoomId: selectedSlot.roomId,
          newResourceId: selectedSlot.resourceId ?? undefined,
        }),
      });
      if (res.status === 409) {
        setError('That slot was just taken. Please choose another.');
        setSelectedSlot(null);
        fetchSlots(selectedDate);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'Failed to reschedule');
        return;
      }
      setExpanded(false);
      onRescheduled();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [bookingId, token, selectedSlot, selectedDate, fetchSlots, onRescheduled]);

  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-navy">Reschedule</h3>
          <p className="mt-1 text-sm text-navy/60">
            {remainingReschedules > 0
              ? `${remainingReschedules} reschedule${remainingReschedules > 1 ? 's' : ''} remaining`
              : 'No reschedules remaining'}
          </p>
        </div>
      </div>

      {!canReschedule && blockedReason && (
        <p className="mt-3 text-sm text-amber-700">{blockedReason}</p>
      )}

      {canReschedule && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-navy/10 bg-white px-4 text-sm font-medium text-navy transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 focus-visible:ring-offset-2"
        >
          Choose New Time
        </button>
      )}

      {canReschedule && expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="reschedule-date" className="block text-sm font-medium text-navy">
              Select Date
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 min-h-touch w-full rounded-lg border border-navy/10 px-3 text-sm text-navy focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/50"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-navy">Available Times</p>
            {loadingSlots && (
              <div className="mt-2 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="min-h-touch animate-pulse rounded-lg bg-navy/10" />
                ))}
              </div>
            )}
            {!loadingSlots && slots.length === 0 && (
              <p className="mt-2 text-sm text-navy/60">No slots available for this date.</p>
            )}
            {!loadingSlots && slots.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((slot) => {
                  const time = new Date(slot.startsAt).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isSelected =
                    selectedSlot?.startsAt === slot.startsAt && selectedSlot?.roomId === slot.roomId;
                  return (
                    <button
                      key={`${slot.startsAt}-${slot.roomId}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex min-h-touch min-w-touch items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'border-navy bg-navy text-white'
                          : 'border-navy/10 bg-white text-navy hover:border-navy/20 hover:bg-beige'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setSelectedSlot(null);
                setError(null);
              }}
              disabled={submitting}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-navy/10 bg-white px-4 text-sm font-medium text-navy transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReschedule}
              disabled={!selectedSlot || submitting}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg bg-navy px-4 text-sm font-medium text-white transition-colors hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Rescheduling...
                </>
              ) : (
                'Confirm New Time'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
