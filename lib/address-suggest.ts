import type { Coordinates } from "@/lib/types";

// Address autocomplete for the "Nearby" search. Photon (OpenStreetMap data) is built for
// search-as-you-type; Nominatim, which the final search uses, explicitly forbids it.
// Limited to the rectangle around Prague, like the rest of the visitor-facing address search.
const PHOTON_URL = "https://photon.komoot.io/api/";
const PRAGUE_BBOX = "14.22,49.94,14.71,50.18"; // minLon,minLat,maxLon,maxLat

export interface AddressSuggestion {
  label: string; // main line, e.g. "I. P. Pavlova"
  secondary: string; // second line, e.g. "Legerova, Vyšehrad"
  coordinates: Coordinates;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    osm_key?: string;
  };
}

// streets and named areas first, then individual buildings and shops
const rankOf = (f: PhotonFeature) => (f.properties?.osm_key === "highway" || f.properties?.osm_key === "place" ? 0 : 1);

const inPrague = (p: NonNullable<PhotonFeature["properties"]>) =>
  /praha|prague/i.test(p.city ?? "") || /praha|prague/i.test(p.district ?? "");

export async function suggestAddresses(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const url = `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=10&bbox=${PRAGUE_BBOX}`;
  const response = await fetch(url, { signal });
  if (!response.ok) return [];
  const data = (await response.json()) as { features?: PhotonFeature[] };

  const seen = new Set<string>();
  const results: (AddressSuggestion & { rank: number })[] = [];
  const features = [...(data.features ?? [])].sort((a, b) => rankOf(a) - rankOf(b));
  for (const feature of features) {
    const p = feature.properties;
    const coords = feature.geometry?.coordinates;
    if (!p || !coords || !inPrague(p)) continue;

    const streetLine = [p.street, p.housenumber].filter(Boolean).join(" ");
    const label = p.name || streetLine;
    if (!label) continue;
    // With a name, the street line is the useful second line; without one it is the label itself
    const secondary = [p.name ? streetLine : "", p.district].filter(Boolean).join(", ");

    // One line per name: Photon returns every stop, entrance and shop sharing a street's name
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      label,
      secondary,
      coordinates: { lat: coords[1], lng: coords[0] },
      rank: rankOf(feature),
    });
  }

  return results
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .map(({ label, secondary, coordinates }) => ({ label, secondary, coordinates }));
}
