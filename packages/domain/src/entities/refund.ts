export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Refund {
  id: string;
  tenantId: string;
  paymentId: string;
  bookingId: string;
  refundedToCardCents: number;
  refundedToPackCents: number;
  refundedToGiftCardCents: number;
  totalCents: number;
  reason: string;
  status: RefundStatus;
  requestedAt: Date;
  completedAt: Date | null;
}
