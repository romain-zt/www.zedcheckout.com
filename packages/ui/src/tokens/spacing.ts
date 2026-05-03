/**
 * zedslot spacing tokens.
 * All spacing uses a 4px base grid.
 */

export const spacing = {
  '2xs': '0.25rem',  // 4px
  xs: '0.5rem',      // 8px
  sm: '0.75rem',     // 12px
  md: '1rem',        // 16px
  lg: '1.5rem',      // 24px
  xl: '2rem',        // 32px
  '2xl': '2.5rem',   // 40px
  '3xl': '3rem',     // 48px
  '4xl': '4rem',     // 64px
  '5xl': '5rem',     // 80px
} as const;

export const cssCustomProperties = {
  '--spacing-2xs': spacing['2xs'],
  '--spacing-xs': spacing.xs,
  '--spacing-sm': spacing.sm,
  '--spacing-md': spacing.md,
  '--spacing-lg': spacing.lg,
  '--spacing-xl': spacing.xl,
  '--spacing-2xl': spacing['2xl'],
  '--spacing-3xl': spacing['3xl'],
  '--spacing-4xl': spacing['4xl'],
  '--spacing-5xl': spacing['5xl'],
} as const;

export const tailwindSpacing = {
  '2xs': 'var(--spacing-2xs)',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  '2xl': 'var(--spacing-2xl)',
  '3xl': 'var(--spacing-3xl)',
  '4xl': 'var(--spacing-4xl)',
  '5xl': 'var(--spacing-5xl)',
} as const;
