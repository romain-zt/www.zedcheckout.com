'use client';

interface Props {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
}

const STATUS_MESSAGES: Record<string, { title: string; message: string }> = {
  cancelled: {
    title: 'Booking Cancelled',
    message: 'This booking has been cancelled. If you were charged, your refund is being processed.',
  },
  completed: {
    title: 'Booking Completed',
    message: 'This booking has already taken place. We hope you enjoyed your session!',
  },
  no_show: {
    title: 'No Show',
    message: 'This booking was marked as a no-show. Please contact us if you believe this is an error.',
  },
  pending: {
    title: 'Payment Pending',
    message: 'Your booking is awaiting payment confirmation. This usually takes a few seconds.',
  },
};

export function StatusDisplay({ status }: Props) {
  const config = STATUS_MESSAGES[status];
  if (!config) return null;

  return (
    <div className="rounded-xl border border-navy/10 bg-beige/50 p-4 sm:p-6">
      <h3 className="text-base font-medium text-navy">{config.title}</h3>
      <p className="mt-1 text-sm text-navy/60">{config.message}</p>
    </div>
  );
}
