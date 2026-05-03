export type PaymentStatus =
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface Payment {
  id: string;
  tenantId: string;
  bookingId: string;
  stripePaymentIntentId: string | null;
  paidByCardCents: number;
  paidByPackCents: number;
  paidByGiftCardCents: number;
  totalCents: number;
  currency: string;
  status: PaymentStatus;
  idempotencyKey: string;
  createdAt: Date;
}
