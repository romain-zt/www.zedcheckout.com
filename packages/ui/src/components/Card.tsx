import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

export const cardVariants = cva(
  'rounded-lg border border-neutral-200 bg-neutral-white transition-shadow',
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-md',
        interactive: 'shadow-sm hover:shadow-md cursor-pointer hover:border-primary-200',
      },
      padding: {
        none: '',
        sm: 'p-sm',
        md: 'p-md',
        lg: 'p-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding, className }))} {...props} />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2xs', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-primary', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-neutral-500', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pt-sm', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center pt-sm', className)} {...props} />;
}
