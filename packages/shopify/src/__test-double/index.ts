import type {
  ShopifyClient,
  ShopifyCustomer,
  CustomerCredit,
  CreateOrderInput,
  ShopifyOrder,
} from '../index';

export class InMemoryShopifyClient implements ShopifyClient {
  readonly customers: Map<string, ShopifyCustomer & CustomerCredit> = new Map();
  readonly orders: Array<CreateOrderInput & { orderId: string }> = [];
  readonly creditWrites: Array<{ customerId: string; newBalanceCents: number; idempotencyKey: string }> = [];
  private processedIdempotencyKeys = new Set<string>();
  private counter = 0;

  addCustomer(
    email: string,
    packCreditCents: number,
    giftCardBalanceCents: number,
  ): ShopifyCustomer {
    const id = `shopify_cust_${++this.counter}`;
    const customer = { id, email, displayName: email.split('@')[0]!, packCreditCents, giftCardBalanceCents };
    this.customers.set(email, customer);
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
    const c = this.customers.get(email);
    return c ? { id: c.id, email: c.email, displayName: c.displayName } : null;
  }

  async getCustomerCredit(customerId: string): Promise<CustomerCredit> {
    const c = Array.from(this.customers.values()).find((x) => x.id === customerId);
    if (!c) return { packCreditCents: 0, giftCardBalanceCents: 0 };
    return { packCreditCents: c.packCreditCents, giftCardBalanceCents: c.giftCardBalanceCents };
  }

  async setCustomerCredit(
    customerId: string,
    newBalanceCents: number,
    idempotencyKey: string,
  ): Promise<void> {
    if (this.processedIdempotencyKeys.has(idempotencyKey)) return;
    this.processedIdempotencyKeys.add(idempotencyKey);

    const c = Array.from(this.customers.values()).find((x) => x.id === customerId);
    if (c) c.packCreditCents = newBalanceCents;
    this.creditWrites.push({ customerId, newBalanceCents, idempotencyKey });
  }

  async createOrder(input: CreateOrderInput): Promise<ShopifyOrder> {
    const orderId = `order_${++this.counter}`;
    this.orders.push({ ...input, orderId });
    return { id: orderId, orderNumber: `#${this.counter}` };
  }

  verifyWebhookSignature(_payload: string, _header: string, _secret: string): boolean {
    return true;
  }
}
