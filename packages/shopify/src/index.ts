export interface ShopifyCustomer {
  id: string;
  email: string;
  displayName: string;
}

export interface CustomerCredit {
  packCreditCents: number;
  giftCardBalanceCents: number;
}

export interface CreateOrderInput {
  tenantId: string;
  bookingId: string;
  customerId: string;
  serviceName: string;
  amountCents: number;
  currency: string;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: string;
}

export interface ShopifyClient {
  getCustomerByEmail(email: string): Promise<ShopifyCustomer | null>;
  getCustomerCredit(customerId: string): Promise<CustomerCredit>;
  setCustomerCredit(customerId: string, newBalanceCents: number, idempotencyKey: string): Promise<void>;
  createOrder(input: CreateOrderInput): Promise<ShopifyOrder>;
  verifyWebhookSignature(payload: string, header: string, secret: string): boolean;
}

export type { ShopifyClient as default };
