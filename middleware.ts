import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'fr-FR',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(fr-FR|en-EN)/:path*']
};
