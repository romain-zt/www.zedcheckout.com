import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-xs py-2xs text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-700',
        primary: 'bg-primary-100 text-primary',
        accent: 'bg-accent-100 text-accent-900',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
