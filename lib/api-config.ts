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

// Helper pro lokální obrázky restaurací
export function getLocalImageUrl(restaurantName: string): string | null {
  const normalized = normalizeFileName(restaurantName);

  // V mobile buildu vracíme lokální cestu
  // Obrázky jsou uloženy jako .webp nebo .jpg
  // Vrátíme .webp jako default (většina obrázků je webp)
  return `/images/restaurants/${normalized}.webp`;
}

// Helper pro proxy obrázků (Google Maps API)
export function getProxiedImageUrl(imageUrl: string | null | undefined, restaurantName?: string): string | null {
  if (!imageUrl) return null;

  // Pro mobile build: pokud máme název restaurace, zkusíme lokální obrázek
  if (IS_MOBILE && restaurantName) {
    // Vracíme lokální cestu - pokud soubor neexistuje, img tag zobrazí error
    // a můžeme fallbacknout na proxy
    const localUrl = getLocalImageUrl(restaurantName);
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
