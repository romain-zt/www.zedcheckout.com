export type Locale = 'fr' | 'en';

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'fr';
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('en')) return 'en';
  return 'fr';
}

export function formatPrice(cents: number, locale: Locale = 'fr'): string {
  const euros = cents / 100;
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(euros);
}

export function localizedName(
  name: Record<'fr' | 'en', string>,
  locale: Locale,
): string {
  return name[locale] || name.fr || name.en || '';
}

export function formatDateTime(
  isoString: string,
  locale: Locale = 'fr',
): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(isoString: string, locale: Locale = 'fr'): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDayShort(
  isoString: string,
  locale: Locale = 'fr',
): { dayName: string; dayNum: string; monthName: string } {
  const date = new Date(isoString);
  return {
    dayName: new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'short',
    }).format(date),
    dayNum: date.getDate().toString(),
    monthName: new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
    }).format(date),
  };
}
