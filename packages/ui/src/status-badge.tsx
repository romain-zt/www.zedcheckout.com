import { Badge, type BadgeProps } from './badge';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: NonNullable<BadgeProps['variant']> }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  completed: { label: 'Completed', variant: 'default' },
  no_show: { label: 'No Show', variant: 'error' },
};

export interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export { StatusBadge };
