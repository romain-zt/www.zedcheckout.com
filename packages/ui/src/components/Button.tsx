import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-neutral-white hover:bg-primary-700 active:bg-primary-800',
        secondary: 'bg-neutral-100 text-primary border border-neutral-300 hover:bg-neutral-200 active:bg-neutral-300',
        ghost: 'text-primary hover:bg-neutral-100 active:bg-neutral-200',
        destructive: 'bg-error text-neutral-white hover:bg-error/90 active:bg-error/80',
      },
      size: {
        sm: 'h-9 min-w-[44px] px-sm text-sm',
        md: 'h-11 min-w-[44px] px-md text-base',
        lg: 'h-13 min-w-[44px] px-lg text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
