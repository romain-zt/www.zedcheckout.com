export type {
  AnalyticsEvent,
  SlotViewedProps,
  SlotSelectedProps,
  CheckoutLoadedProps,
  PaymentSubmittedProps,
  PaymentSucceededProps,
  PaymentFailedProps,
  BookingConfirmedProps,
  BookingCancelledProps,
} from './events.js';

export {
  slotViewed,
  slotSelected,
  checkoutLoaded,
  paymentSubmitted,
  paymentSucceeded,
  paymentFailed,
  bookingConfirmed,
  bookingCancelled,
} from './events.js';

export type { AnalyticsClient, AnalyticsClientOptions } from './client.js';
export { PostHogAnalyticsClient, createAnalyticsClient } from './client.js';
