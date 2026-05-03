/** Computed, never stored. Represents a candidate time window for a Service. */
export interface Slot {
  tenantId: string;
  serviceId: string;
  resourceId: string | null;
  roomId: string;
  startsAt: Date;
  endsAt: Date;
}
