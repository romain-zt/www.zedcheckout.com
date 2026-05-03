export interface CreatePaymentIntentParams {
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

export interface CreateRefundParams {
  paymentIntentId: string;
  amountCents: number;
  idempotencyKey: string;
  reason?: string;
}

export interface RefundResult {
  id: string;
  status: 'pending' | 'succeeded' | 'failed';
  amountCents: number;
}

export interface PaymentsClient {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  getPaymentIntent(id: string): Promise<PaymentIntentResult>;
  createRefund(params: CreateRefundParams): Promise<RefundResult>;
  constructWebhookEvent(body: string, signature: string, secret: string): { type: string; data: { object: Record<string, unknown> } };
}

export type { PaymentsClient as default };
