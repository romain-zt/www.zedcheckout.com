export type EventProperties = Record<string, unknown>;

export interface AnalyticsEvent<T extends string = string> {
  name: T;
  properties: EventProperties;
  timestamp?: Date;
}

export type SlotViewedProps = {
  tenantId: string;
  serviceId: string;
  date: string;
  slotsAvailable: number;
  [key: string]: unknown;
};

export type SlotSelectedProps = {
  tenantId: string;
  serviceId: string;
  resourceId?: string;
  roomId: string;
  startsAt: string;
  [key: string]: unknown;
};

export type CheckoutLoadedProps = {
  tenantId: string;
  serviceId: string;
  priceCents: number;
  hasPackCredit: boolean;
  [key: string]: unknown;
};

export type PaymentSubmittedProps = {
  tenantId: string;
  bookingId: string;
  amountCents: number;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  usedPackCredit: boolean;
  [key: string]: unknown;
};

export type PaymentSucceededProps = {
  tenantId: string;
  bookingId: string;
  amountCents: number;
  [key: string]: unknown;
};

export type PaymentFailedProps = {
  tenantId: string;
  bookingId: string;
  errorCode?: string;
  [key: string]: unknown;
};

export type BookingConfirmedProps = {
  tenantId: string;
  bookingId: string;
  serviceId: string;
  resourceId?: string;
  [key: string]: unknown;
};

export type BookingCancelledProps = {
  tenantId: string;
  bookingId: string;
  reason: 'customer' | 'merchant' | 'no_show' | 'system';
  [key: string]: unknown;
};

export function slotViewed(properties: SlotViewedProps): AnalyticsEvent<'slot_viewed'> {
  return { name: 'slot_viewed', properties };
}

export function slotSelected(properties: SlotSelectedProps): AnalyticsEvent<'slot_selected'> {
  return { name: 'slot_selected', properties };
}

export function checkoutLoaded(properties: CheckoutLoadedProps): AnalyticsEvent<'checkout_loaded'> {
  return { name: 'checkout_loaded', properties };
}

export function paymentSubmitted(properties: PaymentSubmittedProps): AnalyticsEvent<'payment_submitted'> {
  return { name: 'payment_submitted', properties };
}

export function paymentSucceeded(properties: PaymentSucceededProps): AnalyticsEvent<'payment_succeeded'> {
  return { name: 'payment_succeeded', properties };
}

export function paymentFailed(properties: PaymentFailedProps): AnalyticsEvent<'payment_failed'> {
  return { name: 'payment_failed', properties };
}

export function bookingConfirmed(properties: BookingConfirmedProps): AnalyticsEvent<'booking_confirmed'> {
  return { name: 'booking_confirmed', properties };
}

export function bookingCancelled(properties: BookingCancelledProps): AnalyticsEvent<'booking_cancelled'> {
  return { name: 'booking_cancelled', properties };
}
