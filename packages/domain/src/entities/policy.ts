export type PolicyScope = 'global' | `service:${string}`;
export type LateCancelBehavior = 'credit' | 'none';
export type NoShowBehavior = 'charged' | 'refundable' | 'partial';

export interface Policy {
  id: string;
  tenantId: string;
  scope: PolicyScope;
  freeCancelHours: number;
  lateCancelBehavior: LateCancelBehavior;
  noShowBehavior: NoShowBehavior;
  freeRescheduleHours: number;
  maxReschedules: number;
  createdAt: Date;
}
