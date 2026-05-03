export interface AuditLog {
  id: string;
  tenantId: string;
  entityType: 'booking' | 'payment' | 'refund' | 'customer';
  entityId: string;
  action: string;
  actor: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  reason: string;
  createdAt: Date;
}
