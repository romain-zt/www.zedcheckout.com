export type ResourceStatus = 'active' | 'disabled';

export interface Resource {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  status: ResourceStatus;
  createdAt: Date;
}
