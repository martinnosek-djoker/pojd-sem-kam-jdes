// Everything that is moved out of the project while the static (Capacitor) app is built, because
// it needs a server or isn't part of the app. ONE list for both scripts: prepare-mobile-build.mjs
// moves these away, restore-after-mobile-build.mjs puts them back. (They used to keep separate
// copies, and a route missing from the restore copy was deleted along with the backup.)
export const MOBILE_EXCLUDED_PATHS = [
  'app/api/cafes/[id]',
  'app/api/restaurants/[id]',
  'app/api/admin/events/[id]',
  'app/api/trendings/[id]',
  'app/api/bakeries/[id]',
  'app/api/breakfasts',
  'app/api/visits/[id]',
  // Admin-only address autocomplete (LocationAddressFields) added after this
  // list was last updated - reads a query param, so it fails static export.
  'app/api/geocode',
  // Live detail data for the app's card dialogs (reads query params, so it can't be static)
  'app/api/detail',
  // Image resizer for the website (needs the server; the app calls the live site's copy)
  'app/api/img',
  'app/api/legacy-img',
  // Place photos: loaded live from the website in the app instead of being bundled
  // (logo-mark.png stays, the UI uses it)
  'public/images/restaurants',
  'public/images/cafes',
  'public/images/bakeries',
  'public/images/trendings',
  'public/images/reviews',
  // Dynamic detail pages (restaurant/cafe/visit) - not part of the static app,
  // whose cards link out instead (see IS_STATIC_APP in lib/slug.ts).
  'app/@modal',
  'app/restaurace',
  'app/navstevy',
  'app/kavarny/[slug]',
  'app/en/restaurace',
  'app/en/navstevy',
  'app/en/kavarny/[slug]',
];
