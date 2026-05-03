export interface ManageBookingData {
  booking: {
    id: string;
    serviceId: string;
    serviceName: Record<'fr' | 'en', string>;
    resourceId: string | null;
    resourceName: string | null;
    roomId: string;
    startsAt: string;
    endsAt: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    rescheduleCount: number;
    durationMinutes: number;
    priceCents: number;
  };
  policy: {
    freeCancelHours: number;
    freeRescheduleHours: number;
    maxReschedules: number;
    lateCancelBehavior: 'credit' | 'none';
  };
  actions: {
    canCancel: boolean;
    cancelOutcome: 'full_refund' | 'credit_refund' | 'no_refund';
    canReschedule: boolean;
    rescheduleBlockedReason?: string;
  };
}

export interface SlotOption {
  startsAt: string;
  endsAt: string;
  resourceId: string | null;
  roomId: string;
}
