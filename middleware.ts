import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'cs',

  // Always use locale prefix for all routes (e.g., /cs, /en)
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  // Skip API routes, admin, static files, images
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
