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

// Log environment info (useful for debugging)
if (typeof window !== 'undefined') {
  console.log('[API Config]', {
    IS_MOBILE,
    API_BASE_URL,
    Capacitor: (window as any).Capacitor,
  });
}
