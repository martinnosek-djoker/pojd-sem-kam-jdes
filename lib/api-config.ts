// Detekce prostředí
export const IS_MOBILE =
  typeof window !== 'undefined' && !!(window as any).Capacitor;

// API base URL
export const API_BASE_URL = IS_MOBILE
  ? 'https://www.pojdsemkamjdes.cz'
  : '';

// Helper pro API calls
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  return `${API_BASE_URL}${normalizedEndpoint}`;
}

// Helper pro normalizaci názvu souboru (stejná logika jako v download scriptu)
function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper pro lokální obrázky (restaurants, cafes, bakeries, trendings)
export function getLocalImageUrl(name: string, category: string = 'restaurants'): string | null {
  const normalized = normalizeFileName(name);
  // Všechny obrázky ukládáme jako .webp (download skripty normalizují extension)
  return `/images/${category}/${normalized}.webp`;
}

const isGoogleImage = (url: string) => url.includes('maps.googleapis.com') || url.includes('googleusercontent.com');

// Helper pro obrázky podniků.
// Na webu se vrací původní URL. V nativní appce se fotky NEbalí do balíčku (aby nový podnik nebo
// nová fotka nevyžadovaly nový release), ale berou se živě z webu:
//  - relativní cesta (/images/...) -> stejný soubor na webu
//  - odkaz na Google s názvem podniku -> uložená kopie na webu (Google odkazy expirují),
//    teprve při chybě proxy (viz getImageFallbackUrl)
//  - odkaz na Google bez názvu -> proxy
export function getProxiedImageUrl(imageUrl: string | null | undefined, name?: string, category: string = 'restaurants'): string | null {
  if (!imageUrl) return null;
  if (!IS_MOBILE) return imageUrl;

  if (imageUrl.startsWith('/')) return `${API_BASE_URL}${imageUrl}`;

  if (isGoogleImage(imageUrl)) {
    if (name) {
      const localUrl = getLocalImageUrl(name, category);
      if (localUrl) return `${API_BASE_URL}${localUrl}`;
    }
    return `${API_BASE_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
  }

  return imageUrl;
}

// Widths the site's /api/img route serves (see app/api/img/route.ts): pick the smallest that still
// looks sharp where the picture is shown - 192 for the 72 px list thumbnails, 640 for a card
// photo, 960 for a detail dialog's hero.
export type ImageWidth = 192 | 384 | 640 | 960;

const isSupabaseStorageUrl = (url: string) => /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(url);

// A right-sized copy of a photo that lives on the site or in our Supabase Storage, or null for photos
// hosted elsewhere (those can only be shown as they are). Works on the web and in the app alike;
// the app gets it from the live site, so it never depends on an app release.
export function getImageVariantUrl(
  imageUrl: string | null | undefined,
  width: ImageWidth,
  name?: string,
  category: string = 'restaurants'
): string | null {
  if (!imageUrl) return null;

  let source: string | null = null;
  if (imageUrl.startsWith('/images/')) source = imageUrl;
  else if (isGoogleImage(imageUrl)) source = name ? getLocalImageUrl(name, category) : null;
  else if (isSupabaseStorageUrl(imageUrl)) source = imageUrl;
  if (!source) return null;

  return `${API_BASE_URL}/api/img?src=${encodeURIComponent(source)}&w=${width}`;
}

// Second choice when the first image fails in the native app: for Google-hosted photos the
// proxy (the first choice is the copy stored on the site), otherwise nothing more to try.
export function getImageFallbackUrl(imageUrl: string | null | undefined): string | null {
  if (!IS_MOBILE || !imageUrl || !isGoogleImage(imageUrl)) return null;
  return `${API_BASE_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
}

// Log environment info (useful for debugging)
if (typeof window !== 'undefined') {
  console.log('[API Config]', {
    IS_MOBILE,
    API_BASE_URL,
    Capacitor: (window as any).Capacitor,
  });
}
