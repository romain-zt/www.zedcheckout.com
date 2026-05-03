import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

export const skeletonVariants = cva(
  'animate-pulse bg-neutral-200 rounded-md',
  {
    variants: {
      shape: {
        rect: 'rounded-md',
        circle: 'rounded-full',
        text: 'rounded h-4',
      },
    },
    defaultVariants: {
      shape: 'rect',
    },
  },
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ shape, className }))}
      aria-hidden="true"
      {...props}
    />
  );
}
