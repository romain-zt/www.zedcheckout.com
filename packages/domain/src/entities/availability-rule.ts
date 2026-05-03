export type AvailabilityScope = `resource:${string}` | `room:${string}`;
export type AvailabilityKind = 'recurring' | 'override';

export interface AvailabilityRule {
  id: string;
  tenantId: string;
  scope: AvailabilityScope;
  kind: AvailabilityKind;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  isUnavailable: boolean;
  createdAt: Date;
}
