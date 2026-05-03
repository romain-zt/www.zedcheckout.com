export type PackHoldStatus = 'held' | 'debited' | 'released';

export interface PackHold {
  id: string;
  tenantId: string;
  customerId: string;
  bookingId: string;
  amountCents: number;
  status: PackHoldStatus;
  expiresAt: Date;
  createdAt: Date;
}
