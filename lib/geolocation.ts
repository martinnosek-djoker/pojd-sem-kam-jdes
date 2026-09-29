import { Coordinates } from "./types";
import { Geolocation } from "@capacitor/geolocation";
import { Locale } from "./i18n/LocaleContext";

// Detekce mobilní aplikace (Capacitor)
const IS_MOBILE = typeof window !== 'undefined' && !!(window as any).Capacitor;

const GEO_MESSAGES = {
  cs: {
    deniedSettings: "Přístup k poloze byl zamítnut. Povol GPS v nastavení aplikace.",
    denied: "Přístup k poloze byl zamítnut",
    gpsFailed: "Nepodařilo se získat polohu z GPS",
    webOnlyNotice: "Přístup k poloze není v této verzi podporován. Používáš webovou verzi? Zkus mobilní aplikaci.",
    notSupported: "Geolocation není podporována tímto prohlížečem",
    unknown: "Neznámá chyba",
    unavailable: "Informace o poloze nejsou dostupné",
    timeout: "Vypršel čas pro získání polohy",
    searchFailed: "Nepodařilo se vyhledat adresu",
    notFound: "Adresa nebyla nalezena. Zkus zadat konkrétnější místo nebo použít formát: ulice, město",
  },
  en: {
    deniedSettings: "Location access was denied. Enable GPS in the app settings.",
    denied: "Location access was denied",
    gpsFailed: "Could not get your location from GPS",
    webOnlyNotice: "Location access isn't supported in this version. Using the web version? Try the mobile app instead.",
    notSupported: "Geolocation isn't supported by this browser",
    unknown: "Unknown error",
    unavailable: "Location information is unavailable",
    timeout: "Timed out while getting your location",
    searchFailed: "Could not search for the address",
    notFound: "Address not found. Try a more specific place or the format: street, city",
  },
} satisfies Record<Locale, Record<string, string>>;

// Haversine formula to calculate distance between two GPS points in kilometers
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Get user's current location using Capacitor Geolocation (mobile) or browser API (web)
export async function getCurrentPosition(locale: Locale = "cs"): Promise<Coordinates> {
  const m = GEO_MESSAGES[locale];

  if (IS_MOBILE) {
    // Používáme Capacitor Geolocation plugin v mobilní appce
    try {
      // Zkontrolovat a požádat o oprávnění
      const permission = await Geolocation.checkPermissions();

      if (permission.location === 'denied') {
        throw new Error(m.deniedSettings);
      }

      if (permission.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new Error(m.denied);
        }
      }

      // Získat aktuální polohu
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (error: any) {
      console.error('[Geolocation] Capacitor error:', error);

      // Přeložit technické hlášky do srozumitelného textu
      let message = error.message || m.gpsFailed;

      if (message.includes("not implemented") || message.includes("Not implemented")) {
        message = m.webOnlyNotice;
      }

      throw new Error(message);
    }
  } else {
    // Používáme browser's Geolocation API na webu
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(m.notSupported));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = m.unknown;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = m.denied;
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = m.unavailable;
              break;
            case error.TIMEOUT:
              errorMessage = m.timeout;
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }
}

// Geocode an address to coordinates using Nominatim API
export async function geocodeAddress(address: string, locale: Locale = "cs"): Promise<{ coordinates: Coordinates; displayName: string }> {
  const m = GEO_MESSAGES[locale];
  try {
    // Použijeme OpenStreetMap Nominatim API (zdarma, bez API klíče)
    const encodedAddress = encodeURIComponent(address);
    // Limit 5 - dostaneme více výsledků pro lepší výběr
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=5&countrycodes=cz&addressdetails=1&extratags=1&accept-language=${locale}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GastroTips/1.0' // Nominatim vyžaduje User-Agent
      }
    });

    if (!response.ok) {
      throw new Error(m.searchFailed);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(m.notFound);
    }

    // Funkce pro skórování relevance výsledku
    const scoreResult = (result: any): number => {
      let score = 0;

      // Preferujeme konkrétní místa (POI) před obecnými oblastmi
      const type = result.type?.toLowerCase() || '';
      const category = result.class?.toLowerCase() || '';
      const osmType = result.osm_type?.toLowerCase() || '';

      // Nejvyšší priorita: konkrétní budovy a POI
      if (category === 'amenity' || category === 'tourism' || category === 'shop' ||
          category === 'building' || category === 'leisure') {
        score += 100;
      }

      // Střední priorita: ulice a adresy
      if (type === 'house' || type === 'building' || type === 'commercial' ||
          type === 'retail' || type === 'mall' || category === 'highway') {
        score += 50;
      }

      // Nízká priorita: administrativní oblasti
      if (type === 'administrative' || type === 'city' || type === 'suburb' ||
          type === 'district' || type === 'neighbourhood') {
        score += 10;
      }

      // Bonus pro node (konkrétní bod) vs way/relation (oblast)
      if (osmType === 'node') {
        score += 20;
      }

      // Bonus pokud má číslo popisné (přesná adresa)
      if (result.address?.house_number) {
        score += 30;
      }

      return score;
    };

    // Seřadíme výsledky podle relevance
    const scoredResults = data.map((result: any) => ({
      result,
      score: scoreResult(result)
    }));

    scoredResults.sort((a: any, b: any) => b.score - a.score);

    // Vezmeme nejvíce relevantní výsledek
    const bestResult = scoredResults[0].result;

    console.log('[Geocoding] Selected result:', {
      name: bestResult.display_name,
      type: bestResult.type,
      class: bestResult.class,
      osmType: bestResult.osm_type,
      score: scoredResults[0].score
    });

    return {
      coordinates: {
        lat: parseFloat(bestResult.lat),
        lng: parseFloat(bestResult.lon),
      },
      displayName: bestResult.display_name,
    };
  } catch (error: any) {
    console.error('[Geocoding] Error:', error);
    throw new Error(error.message || m.searchFailed);
  }
}
