import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const cardVariants = cva(
  'rounded-xl border transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white border-navy/10 shadow-sm',
        selected: 'bg-white border-navy ring-2 ring-navy/20 shadow-md',
        muted: 'bg-beige/50 border-navy/5',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-md hover:border-navy/20 active:scale-[0.98] min-h-[44px]',
      },
      padding: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, interactive, padding, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export { Card, cardVariants };
