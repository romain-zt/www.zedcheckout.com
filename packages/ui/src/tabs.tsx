import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

export const tabsListVariants = cva(
  'inline-flex items-center gap-2xs rounded-lg bg-neutral-100 p-2xs',
  {
    variants: {
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      fullWidth: false,
    },
  },
);

export const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-sm py-xs text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]',
  {
    variants: {
      active: {
        true: 'bg-neutral-white text-primary shadow-sm',
        false: 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue: string;
}

export function TabsList({ className, fullWidth, ...props }: TabsListProps) {
  return (
    <div
      className={cn(tabsListVariants({ fullWidth, className }))}
      role="tablist"
      {...props}
    />
  );
}

export function TabsTrigger({ className, active, value, ...props }: TabsTriggerProps) {
  return (
    <button
      className={cn(tabsTriggerVariants({ active, className }))}
      role="tab"
      aria-selected={active ?? false}
      data-value={value}
      {...props}
    />
  );
}

export function TabsContent({ className, value, activeValue, children, ...props }: TabsContentProps) {
  if (value !== activeValue) return null;

  return (
    <div
      className={cn('mt-sm focus-visible:outline-none', className)}
      role="tabpanel"
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
}
