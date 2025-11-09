// Environment detection a API configuration pro mobile app

/**
 * Detekuje jestli aplikace běží v Capacitor mobile app
 */
export const IS_MOBILE = typeof window !== 'undefined' &&
  (window as any).Capacitor !== undefined;

/**
 * Base URL pro API calls
 * - V mobile app: plná URL na produkční server
 * - Ve web app: relativní path (proxy přes Next.js)
 */
export const API_BASE_URL = IS_MOBILE
  ? 'https://www.pojdsemkamjdes.cz'
  : '';

/**
 * Helper funkce pro sestavení plné API URL
 *
 * @param endpoint - API endpoint (např. '/api/restaurants')
 * @returns Plná URL k API endpointu
 *
 * @example
 * ```typescript
 * const url = getApiUrl('/api/restaurants');
 * // Web: '/api/restaurants'
 * // Mobile: 'https://www.pojdsemkamjdes.cz/api/restaurants'
 * ```
 */
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
}

/**
 * Helper pro fetch s automatickou URL konverzí
 *
 * @example
 * ```typescript
 * const response = await fetchApi('/api/restaurants');
 * const data = await response.json();
 * ```
 */
export async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  return fetch(getApiUrl(endpoint), options);
}

/**
 * Detekce platformy
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (!IS_MOBILE) return 'web';

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';

  return 'web';
}

/**
 * Log pro debugging (zobrazí se jen v development)
 */
export function debugLog(...args: any[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[App]', ...args);
  }
}
