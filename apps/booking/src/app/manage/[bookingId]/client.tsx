'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookingSummary } from './booking-summary';
import { CancelSection } from './cancel-section';
import { RescheduleSection } from './reschedule-section';
import { StatusDisplay } from './status-display';
import type { ManageBookingData } from './types';

interface Props {
  bookingId: string;
  token: string;
}

type ViewState = 'loading' | 'ready' | 'error' | 'expired';

export function ManageBookingClient({ bookingId, token }: Props) {
  const [state, setState] = useState<ViewState>('loading');
  const [data, setData] = useState<ManageBookingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`/api/bookings/${bookingId}/manage?token=${encodeURIComponent(token)}`);
      if (res.status === 401) {
        setState('expired');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'Something went wrong');
        setState('error');
        return;
      }
      const body = await res.json();
      setData(body);
      setState('ready');
    } catch {
      setError('Unable to load booking. Please try again.');
      setState('error');
    }
  }, [bookingId, token]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  if (state === 'loading') {
    return <LoadingState />;
  }

  if (state === 'expired') {
    return (
      <CenteredMessage
        title="Link Expired"
        message="This manage-booking link has expired. Please check your email for a newer link, or contact support."
      />
    );
  }

  if (state === 'error' || !data) {
    return (
      <CenteredMessage
        title="Something went wrong"
        message={error ?? 'Unable to load your booking details.'}
      />
    );
  }

  const isActionable = data.booking.status === 'confirmed';

  return (
    <main className="min-h-screen bg-beige px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-navy sm:text-2xl">Manage Booking</h1>
        </header>

        <BookingSummary booking={data.booking} />

        {!isActionable && <StatusDisplay status={data.booking.status} />}

        {isActionable && (
          <>
            <CancelSection
              bookingId={bookingId}
              token={token}
              policy={data.policy}
              cancelOutcome={data.actions.cancelOutcome}
              onCancelled={fetchBooking}
            />

            <RescheduleSection
              bookingId={bookingId}
              token={token}
              booking={data.booking}
              policy={data.policy}
              canReschedule={data.actions.canReschedule}
              blockedReason={data.actions.rescheduleBlockedReason}
              onRescheduled={fetchBooking}
            />
          </>
        )}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-beige px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="h-7 w-48 animate-pulse rounded bg-navy/10" />
        <div className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-navy/10" />
          </div>
        </div>
      </div>
    </main>
  );
}

function CenteredMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-beige p-4">
      <div className="w-full max-w-md rounded-xl border border-navy/10 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-navy/60">{message}</p>
      </div>
    </main>
  );
}
