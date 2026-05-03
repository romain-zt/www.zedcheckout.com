export interface Customer {
  id: string;
  tenantId: string;
  shopifyCustomerId: string | null;
  email: string;
  displayName: string;
  phone: string | null;
  packCreditCents: number;
  giftCardBalanceCents: number;
  createdAt: Date;
}
