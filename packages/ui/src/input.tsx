import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-navy"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'h-11 min-h-[44px] w-full rounded-lg border border-navy/20 bg-white px-3 text-base text-navy placeholder:text-navy/40 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500/30',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
