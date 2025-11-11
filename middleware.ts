import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'cs',

  // Always use locale prefix for all routes (e.g., /cs, /en)
  localePrefix: 'always',

  // Ensure locale is detected from browser
  localeDetection: true
});

export const config = {
  // Match only internationalized pathnames
  // Skip API routes, admin, static files, images
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/admin`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|admin|_next|_vercel|.*\\..*).*)'
  ]
};
