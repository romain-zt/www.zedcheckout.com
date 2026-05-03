import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from './cn';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = 'horizontal', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          orientation === 'horizontal'
            ? 'overflow-x-auto overflow-y-hidden scrollbar-none'
            : 'overflow-y-auto overflow-x-hidden scrollbar-none',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
