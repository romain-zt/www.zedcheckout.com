import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

export const dialogOverlayVariants = cva(
  'fixed inset-0 z-50 bg-neutral-black/50 backdrop-blur-sm',
  {
    variants: {
      state: {
        open: 'animate-in fade-in-0',
        closed: 'animate-out fade-out-0',
      },
    },
    defaultVariants: {
      state: 'open',
    },
  },
);

export const dialogContentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-neutral-white p-lg shadow-lg focus:outline-none',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        full: 'max-w-[calc(100vw-2rem)] sm:max-w-lg',
      },
    },
    defaultVariants: {
      size: 'full',
    },
  },
);

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogContentVariants> {}

export function DialogOverlay({ className, open, onClose, ...props }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className={cn(dialogOverlayVariants({ state: 'open', className }))}
      onClick={onClose}
      aria-hidden="true"
      {...props}
    />
  );
}

export function DialogContent({ className, size, children, ...props }: DialogContentProps) {
  return (
    <div
      className={cn(dialogContentVariants({ size, className }))}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {children}
    </div>
  );
}

export function Dialog({ open, onClose, children, className, ...props }: DialogProps) {
  if (!open) return null;

  return (
    <div className={cn('fixed inset-0 z-50', className)} {...props}>
      <DialogOverlay open={open} onClose={onClose} />
      {children}
    </div>
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-xl font-semibold text-primary', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-neutral-500 mt-xs', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex justify-end gap-sm mt-lg', className)} {...props} />;
}
