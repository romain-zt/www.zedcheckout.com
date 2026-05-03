type FunnelEvent =
  | 'slot_viewed'
  | 'slot_selected'
  | 'checkout_loaded'
  | 'payment_method_chosen'
  | 'payment_submitted'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'booking_confirmed';

interface EventProperties {
  tenantId?: string;
  serviceId?: string;
  resourceId?: string;
  slotStartsAt?: string;
  bookingId?: string;
  paymentMethod?: string;
  error?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Typed analytics event tracker.
 * V0: logs to console in development, no-op in production.
 * V0.1: will be replaced by @zedslot/analytics (PostHog wrapper).
 */
export function trackEvent(event: FunnelEvent, properties?: EventProperties): void {
  if (typeof window === 'undefined') return;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[analytics] ${event}`, properties);
  }

  // PostHog integration point — will be wired via @zedslot/analytics package
  const win = window as unknown as Record<string, unknown>;
  if (typeof win.posthog === 'object' && win.posthog !== null) {
    const ph = win.posthog as {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
    ph.capture(event, properties);
  }
}
