import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

export const radioGroupVariants = cva('flex', {
  variants: {
    orientation: {
      vertical: 'flex-col gap-sm',
      horizontal: 'flex-row gap-md flex-wrap',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export const radioItemVariants = cva(
  'flex items-center gap-sm cursor-pointer min-h-[44px] px-sm py-xs rounded-md transition-colors',
  {
    variants: {
      selected: {
        true: 'bg-primary-50 border border-primary-200',
        false: 'border border-neutral-200 hover:bg-neutral-50',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof radioGroupVariants> {
  value?: string;
  onValueChange?: (value: string) => void;
  name: string;
}

export interface RadioItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  label: string;
  description?: string;
  selected?: boolean;
}

export function RadioGroup({
  className,
  orientation,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <div
      className={cn(radioGroupVariants({ orientation, className }))}
      role="radiogroup"
      {...props}
    />
  );
}

export function RadioItem({
  className,
  value,
  label,
  description,
  selected,
  name,
  onChange,
  ...props
}: RadioItemProps & { name?: string }) {
  const id = `${name}-${value}`;

  return (
    <label
      htmlFor={id}
      className={cn(radioItemVariants({ selected, className }))}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={selected}
        onChange={onChange}
        className="sr-only"
        {...props}
      />
      <span className={cn(
        'flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors',
        selected ? 'border-primary bg-primary' : 'border-neutral-400',
      )}>
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-neutral-white" />}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-primary">{label}</span>
        {description && (
          <span className="text-xs text-neutral-500">{description}</span>
        )}
      </div>
    </label>
  );
}
