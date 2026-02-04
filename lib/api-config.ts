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

// Helper pro lokální obrázky (restaurants, cafes, bakeries, michelin, trendings)
export function getLocalImageUrl(name: string, category: string = 'restaurants'): string | null {
  const normalized = normalizeFileName(name);
  // Všechny obrázky ukládáme jako .webp (download skripty normalizují extension)
  return `/images/${category}/${normalized}.webp`;
}

// Helper pro proxy obrázků (Google Maps API)
export function getProxiedImageUrl(imageUrl: string | null | undefined, name?: string, category: string = 'restaurants'): string | null {
  if (!imageUrl) return null;

  // Pro mobile build: pokud máme název, zkusíme lokální obrázek
  if (IS_MOBILE && name) {
    const localUrl = getLocalImageUrl(name, category);
    if (localUrl) return localUrl;
  }

  // V mobilní appce používáme proxy endpoint pro obrázky z Google
  // Podporujeme jak maps.googleapis.com tak lh3.googleusercontent.com (Google Photos)
  if (IS_MOBILE && (imageUrl.includes('maps.googleapis.com') || imageUrl.includes('googleusercontent.com'))) {
    const encodedUrl = encodeURIComponent(imageUrl);
    return `${API_BASE_URL}/api/proxy/image?url=${encodedUrl}`;
  }

  // Na webu vrátíme původní URL
  return imageUrl;
}

// Log environment info (useful for debugging)
if (typeof window !== 'undefined') {
  console.log('[API Config]', {
    IS_MOBILE,
    API_BASE_URL,
    Capacitor: (window as any).Capacitor,
  });
}
