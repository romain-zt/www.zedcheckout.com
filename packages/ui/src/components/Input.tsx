import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

export const inputVariants = cva(
  'flex w-full rounded-md border bg-neutral-white px-sm py-xs text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]',
  {
    variants: {
      state: {
        default: 'border-neutral-300 focus-visible:ring-primary/50',
        error: 'border-error focus-visible:ring-error/50',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
}

export function Input({ className, state, label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const resolvedState = error ? 'error' : state;

  return (
    <div className="flex flex-col gap-2xs">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-primary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(inputVariants({ state: resolvedState, className }))}
        aria-invalid={resolvedState === 'error' ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
