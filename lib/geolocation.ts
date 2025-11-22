import { Coordinates } from "./types";
import { Geolocation } from "@capacitor/geolocation";

// Detekce mobilní aplikace (Capacitor)
const IS_MOBILE = typeof window !== 'undefined' && !!(window as any).Capacitor;

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
export async function getCurrentPosition(): Promise<Coordinates> {
  if (IS_MOBILE) {
    // Používáme Capacitor Geolocation plugin v mobilní appce
    try {
      // Zkontrolovat a požádat o oprávnění
      const permission = await Geolocation.checkPermissions();

      if (permission.location === 'denied') {
        throw new Error("Přístup k poloze byl zamítnut. Povol GPS v nastavení aplikace.");
      }

      if (permission.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new Error("Přístup k poloze byl zamítnut");
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
      throw new Error(error.message || "Nepodařilo se získat polohu z GPS");
    }
  } else {
    // Používáme browser's Geolocation API na webu
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation není podporována tímto prohlížečem"));
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
          let errorMessage = "Neznámá chyba";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Přístup k poloze byl zamítnut";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Informace o poloze nejsou dostupné";
              break;
            case error.TIMEOUT:
              errorMessage = "Vypršel čas pro získání polohy";
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
