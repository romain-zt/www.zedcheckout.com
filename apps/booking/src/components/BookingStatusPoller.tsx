'use client';

import { useEffect, useRef } from 'react';
import { Card, Spinner } from '@zedslot/ui';

interface BookingStatusPollerProps {
  bookingId: string;
  onConfirmed: () => void;
  onFailed: () => void;
}

const MAX_POLLS = 30;
const POLL_INTERVAL_MS = 2000;

export function BookingStatusPoller({ bookingId, onConfirmed, onFailed }: BookingStatusPollerProps) {
  const pollCount = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function poll() {
      if (cancelled || pollCount.current >= MAX_POLLS) {
        if (pollCount.current >= MAX_POLLS) onFailed();
        return;
      }

      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) {
          pollCount.current++;
          timeout = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }

        const data = await res.json();

        if (data.status === 'confirmed') {
          if (!cancelled) onConfirmed();
          return;
        }

        if (data.status === 'cancelled') {
          if (!cancelled) onFailed();
          return;
        }

        pollCount.current++;
        timeout = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        pollCount.current++;
        timeout = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [bookingId, onConfirmed, onFailed]);

  return (
    <Card variant="default" padding="lg">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <Spinner size="lg" />
        <div>
          <p className="font-medium">Confirmation en cours...</p>
          <p className="text-sm text-navy/60">
            Veuillez patienter quelques instants
          </p>
        </div>
      </div>
    </Card>
  );
}
