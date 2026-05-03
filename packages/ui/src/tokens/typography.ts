/**
 * zedslot typography tokens.
 * Font families, sizes, weights, and line heights.
 */

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const letterSpacing = {
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
} as const;

export const cssCustomProperties = {
  '--font-sans': fontFamily.sans.join(', '),
  '--font-mono': fontFamily.mono.join(', '),
  '--font-weight-normal': fontWeight.normal,
  '--font-weight-medium': fontWeight.medium,
  '--font-weight-semibold': fontWeight.semibold,
  '--font-weight-bold': fontWeight.bold,
  '--letter-spacing-tight': letterSpacing.tight,
  '--letter-spacing-normal': letterSpacing.normal,
  '--letter-spacing-wide': letterSpacing.wide,
} as const;

export const tailwindFontFamily = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
} as const;
