'use client';

import { useCallback, useState } from 'react';
import type { ManageBookingData } from './types';

interface Props {
  bookingId: string;
  token: string;
  policy: ManageBookingData['policy'];
  cancelOutcome: ManageBookingData['actions']['cancelOutcome'];
  onCancelled: () => void;
}

export function CancelSection({ bookingId, token, policy, cancelOutcome, onCancelled }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason: reason || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'Failed to cancel booking');
        return;
      }
      setShowModal(false);
      onCancelled();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [bookingId, token, reason, onCancelled]);

  return (
    <>
      <div className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-medium text-navy">Cancel Booking</h3>
        <PolicyText policy={policy} cancelOutcome={cancelOutcome} />
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mt-4 inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          Cancel Booking
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
            onClick={() => !loading && setShowModal(false)}
          />
          <div className="relative w-full max-w-md rounded-t-xl bg-white p-6 shadow-lg sm:m-4 sm:rounded-xl">
            <h2 className="text-lg font-semibold text-navy">Confirm Cancellation</h2>
            <p className="mt-2 text-sm text-navy/60">
              {cancelOutcome === 'full_refund' && 'You will receive a full refund to your original payment method.'}
              {cancelOutcome === 'credit_refund' && 'The amount will be added as pack credit to your account.'}
              {cancelOutcome === 'no_refund' && 'This is a late cancellation. No refund will be issued.'}
            </p>

            <div className="mt-4">
              <label htmlFor="cancel-reason" className="block text-sm font-medium text-navy">
                Reason (optional)
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-navy/10 px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/50"
                placeholder="Let us know why you're cancelling..."
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-navy/10 bg-white px-4 text-sm font-medium text-navy transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PolicyText({
  policy,
  cancelOutcome,
}: {
  policy: ManageBookingData['policy'];
  cancelOutcome: ManageBookingData['actions']['cancelOutcome'];
}) {
  return (
    <div className="mt-3 space-y-1 text-sm text-navy/60">
      <p>
        Free cancellation up to <strong>{policy.freeCancelHours}h</strong> before your booking.
      </p>
      {cancelOutcome === 'full_refund' && (
        <p className="text-green-700">You are within the free cancellation window. Full refund applies.</p>
      )}
      {cancelOutcome === 'credit_refund' && (
        <p className="text-amber-700">
          Late cancellation — the amount will be converted to pack credit.
        </p>
      )}
      {cancelOutcome === 'no_refund' && (
        <p className="text-red-700">
          Late cancellation — no refund will be issued per our policy.
        </p>
      )}
    </div>
  );
}
