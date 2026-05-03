'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Card, Spinner } from '@zedslot/ui';
import { formatPrice, type Locale } from '@/lib/locale';

interface BookingResult {
  bookingId: string;
  paymentIntentClientSecret: string | null;
  expiresAt: string | null;
  confirmed?: boolean;
}

interface PaymentSectionProps {
  servicePriceCents: number;
  creditCents: number;
  locale: Locale;
  onCreateBooking: () => Promise<BookingResult | null>;
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
  bookingResult: BookingResult | null;
}

const labels = {
  fr: {
    title: 'Paiement',
    pay: 'Payer',
    processing: 'Traitement en cours...',
    total: 'Total',
    credit: 'Crédit appliqué',
    toPay: 'À payer',
    stripeLoading: 'Chargement du paiement...',
    bookingCreating: 'Réservation en cours...',
    noPaymentNeeded: 'Aucun paiement nécessaire',
    confirmBooking: 'Confirmer la réservation',
  },
  en: {
    title: 'Payment',
    pay: 'Pay',
    processing: 'Processing...',
    total: 'Total',
    credit: 'Credit applied',
    toPay: 'To pay',
    stripeLoading: 'Loading payment...',
    bookingCreating: 'Creating booking...',
    noPaymentNeeded: 'No payment needed',
    confirmBooking: 'Confirm booking',
  },
};

export function PaymentSection({
  servicePriceCents,
  creditCents,
  locale,
  onCreateBooking,
  onPaymentSuccess,
  onPaymentError,
  bookingResult,
}: PaymentSectionProps) {
  const t = labels[locale];
  const cardAmount = servicePriceCents - creditCents;
  const [loading, setLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeElements, setStripeElements] = useState<{
    stripe: import('@stripe/stripe-js').Stripe;
    elements: import('@stripe/stripe-js').StripeElements;
  } | null>(null);

  // Load Stripe when we have a client secret
  useEffect(() => {
    if (!bookingResult?.paymentIntentClientSecret || cardAmount <= 0) return;

    let cancelled = false;

    async function initStripe() {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey || cancelled) return;

      const stripe = await loadStripe(stripeKey);
      if (!stripe || cancelled) return;

      const elements = stripe.elements({
        clientSecret: bookingResult!.paymentIntentClientSecret!,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1E2A47',
            colorBackground: '#FFFFFF',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      });

      const paymentElement = elements.create('payment', {
        layout: 'tabs',
        wallets: { applePay: 'auto', googlePay: 'auto' },
      });

      const container = document.getElementById('stripe-payment-element');
      if (container && !cancelled) {
        paymentElement.mount(container);
        paymentElement.on('ready', () => {
          if (!cancelled) setStripeReady(true);
        });
        setStripeElements({ stripe, elements });
      }
    }

    initStripe();
    return () => { cancelled = true; };
  }, [bookingResult?.paymentIntentClientSecret, cardAmount]);

  const handleCreateAndPay = useCallback(async () => {
    setLoading(true);

    // If no booking yet, create one
    if (!bookingResult) {
      const result = await onCreateBooking();
      if (!result) {
        setLoading(false);
        return;
      }

      // Credit-only booking: already confirmed
      if (result.confirmed) {
        setLoading(false);
        return;
      }

      // Card payment needed — Stripe will load via useEffect
      if (result.paymentIntentClientSecret) {
        setLoading(false);
        return;
      }
    }

    // Confirm Stripe payment
    if (stripeElements && bookingResult?.paymentIntentClientSecret) {
      const { stripe, elements } = stripeElements;
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/?bookingId=${bookingResult.bookingId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onPaymentError(error.message ?? 'Payment failed');
        setLoading(false);
        return;
      }

      onPaymentSuccess();
      setLoading(false);
    }
  }, [bookingResult, stripeElements, onCreateBooking, onPaymentSuccess, onPaymentError]);

  return (
    <section aria-label={t.title}>
      <h2 className="mb-3 text-lg font-semibold">{t.title}</h2>

      {/* Price breakdown */}
      <Card variant="muted" padding="md" className="mb-4">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span>{t.total}</span>
            <span>{formatPrice(servicePriceCents, locale)}</span>
          </div>
          {creditCents > 0 && (
            <div className="flex justify-between text-green-700">
              <span>{t.credit}</span>
              <span>-{formatPrice(creditCents, locale)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-navy/10 pt-1 font-semibold">
            <span>{t.toPay}</span>
            <span>{formatPrice(cardAmount, locale)}</span>
          </div>
        </div>
      </Card>

      {/* Stripe Payment Element */}
      {cardAmount > 0 && bookingResult?.paymentIntentClientSecret && (
        <div className="mb-4">
          <div id="stripe-payment-element" className="min-h-[100px]" />
          {!stripeReady && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Spinner size="sm" />
              <span className="text-sm text-navy/60">{t.stripeLoading}</span>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {cardAmount <= 0 ? (
        <Button
          variant="accent"
          size="lg"
          fullWidth
          onClick={handleCreateAndPay}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" className="text-white" />
              {t.processing}
            </span>
          ) : (
            t.confirmBooking
          )}
        </Button>
      ) : !bookingResult ? (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleCreateAndPay}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" className="text-white" />
              {t.bookingCreating}
            </span>
          ) : (
            `${t.pay} ${formatPrice(cardAmount, locale)}`
          )}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleCreateAndPay}
          disabled={loading || !stripeReady}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" className="text-white" />
              {t.processing}
            </span>
          ) : (
            `${t.pay} ${formatPrice(cardAmount, locale)}`
          )}
        </Button>
      )}
    </section>
  );
}
