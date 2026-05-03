export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
  id: string;
  tenantId: string;
  serviceId: string;
  resourceId: string | null;
  roomId: string;
  customerId: string;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
  paymentId: string;
  policyId: string;
  rescheduleCount: number;
  createdAt: Date;
}
