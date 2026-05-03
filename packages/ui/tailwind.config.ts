import type { Config } from 'tailwindcss';
import { tailwindColors, cssCustomProperties as colorProperties } from './src/tokens/colors.js';
import { tailwindSpacing, cssCustomProperties as spacingProperties } from './src/tokens/spacing.js';
import {
  tailwindFontFamily,
  fontSize,
  cssCustomProperties as typographyProperties,
} from './src/tokens/typography.js';

/**
 * Tailwind preset for zedslot apps.
 * Consuming apps extend this preset in their own tailwind.config.ts:
 *
 * ```ts
 * import zedslotPreset from '@zedslot/ui/tailwind.config';
 * export default { presets: [zedslotPreset], ... }
 * ```
 */
const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: tailwindColors,
      spacing: tailwindSpacing,
      fontFamily: tailwindFontFamily,
      fontSize: fontSize as unknown as Record<string, [string, { lineHeight: string }]>,
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [
    function ({ addBase }: { addBase: (styles: Record<string, Record<string, string>>) => void }) {
      addBase({
        ':root': {
          ...colorProperties,
          ...spacingProperties,
          ...typographyProperties,
        },
      });
    },
  ],
};

export default preset;
