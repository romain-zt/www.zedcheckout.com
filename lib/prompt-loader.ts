import { readFileSync } from 'fs';
import { join } from 'path';

export type Locale = 'fr-FR' | 'en-EN';

export type PromptType = 
  | 'chat-agent'
  | 'chat-lead'
  | 'research';

/**
 * Load a prompt file based on type and locale
 * @param type - The prompt type (chat-agent, chat-lead, research)
 * @param locale - The locale (fr-FR or en-EN)
 * @returns The prompt content as a string
 */
export function loadPrompt(type: PromptType, locale: Locale = 'fr-FR'): string {
  try {
    const promptPath = join(process.cwd(), 'prompts', `${type}.${locale}.md`);
    const content = readFileSync(promptPath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`[PromptLoader] Failed to load prompt: ${type}.${locale}.md`, error);
    throw new Error(`Failed to load prompt: ${type}.${locale}.md`);
  }
}

/**
 * Normalize locale from common formats to our format
 * @param locale - Input locale (e.g., 'fr', 'fr-FR', 'en', 'en-US', 'en-EN')
 * @returns Normalized locale (fr-FR or en-EN)
 */
export function normalizeLocale(locale?: string): Locale {
  if (!locale) return 'fr-FR';
  
  const lower = locale.toLowerCase();
  
  // French variants
  if (lower.startsWith('fr')) {
    return 'fr-FR';
  }
  
  // English variants
  if (lower.startsWith('en')) {
    return 'en-EN';
  }
  
  // Default to French
  return 'fr-FR';
}
