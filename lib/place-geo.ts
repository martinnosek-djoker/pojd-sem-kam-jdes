import type { Cafe, Restaurant } from "@/lib/types";

export interface PlacePoint {
  label: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

// A place can have several branches ("Anděl, Letná"); addresses/coordinates are
// keyed by those branch names, but the keys aren't guaranteed to match the
// location string exactly, so both are merged.
export function getPlacePoints(place: Restaurant | Cafe): PlacePoint[] {
  const labels = place.location.split(",").map((l) => l.trim()).filter(Boolean);
  for (const key of [...Object.keys(place.coordinates ?? {}), ...Object.keys(place.addresses ?? {})]) {
    if (!labels.includes(key)) labels.push(key);
  }

  return labels.map((label) => {
    const c = place.coordinates?.[label];
    return {
      label,
      address: place.addresses?.[label] ?? null,
      lat: c?.lat ?? null,
      lng: c?.lng ?? null,
    };
  });
}

export function isInstagram(url: string): boolean {
  try {
    return new URL(url).hostname.replace(/^www\./, "").endsWith("instagram.com");
  } catch {
    return false;
  }
}
