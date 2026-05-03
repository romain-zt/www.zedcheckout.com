import type {
  PaymentsClient,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  CreateRefundParams,
  RefundResult,
} from '../index.js';

export class InMemoryPaymentsClient implements PaymentsClient {
  readonly intents: Map<string, PaymentIntentResult> = new Map();
  readonly refunds: Map<string, RefundResult> = new Map();
  private counter = 0;

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const existing = Array.from(this.intents.values()).find(
      (i) => i.id.includes(params.idempotencyKey),
    );
    if (existing) return existing;

    const id = `pi_test_${++this.counter}`;
    const result: PaymentIntentResult = {
      id,
      clientSecret: `${id}_secret`,
      status: 'requires_payment_method',
    };
    this.intents.set(id, result);
    return result;
  }

  async getPaymentIntent(id: string): Promise<PaymentIntentResult> {
    const intent = this.intents.get(id);
    if (!intent) throw new Error(`PaymentIntent ${id} not found`);
    return intent;
  }

  async createRefund(params: CreateRefundParams): Promise<RefundResult> {
    const existing = this.refunds.get(params.idempotencyKey);
    if (existing) return existing;

    const id = `re_test_${++this.counter}`;
    const result: RefundResult = {
      id,
      status: 'succeeded',
      amountCents: params.amountCents,
    };
    this.refunds.set(params.idempotencyKey, result);
    return result;
  }

  constructWebhookEvent(body: string, _signature: string, _secret: string) {
    return JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
  }

  /** Test helper: simulate successful payment */
  simulatePaymentSuccess(intentId: string): void {
    const intent = this.intents.get(intentId);
    if (intent) intent.status = 'succeeded';
  }

  /** Test helper: simulate failed payment */
  simulatePaymentFailure(intentId: string): void {
    const intent = this.intents.get(intentId);
    if (intent) intent.status = 'canceled';
  }
}
