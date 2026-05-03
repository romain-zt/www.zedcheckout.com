export type ServiceStatus = 'active' | 'disabled';

export interface Service {
  id: string;
  tenantId: string;
  name: Record<'fr' | 'en', string>;
  description: Record<'fr' | 'en', string> | null;
  durationMinutes: number;
  priceCents: number;
  eligibleResourceIds: string[];
  eligibleRoomIds: string[];
  requiresResource: boolean;
  requiresRoom: boolean;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}
