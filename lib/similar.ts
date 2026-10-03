import { CUISINE_HIERARCHY, type Cafe, type Restaurant } from "@/lib/types";

const tokens = (cuisine: string) =>
  cuisine.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

// "korejská" -> "asijská" (via CUISINE_HIERARCHY), so related cuisines still match loosely.
function parentOf(token: string): string | null {
  for (const [category, subs] of Object.entries(CUISINE_HIERARCHY)) {
    if (token === category.toLowerCase() || subs.some((sub) => token.includes(sub))) return category.toLowerCase();
  }
  return null;
}

export function similarRestaurants(place: Restaurant, all: Restaurant[], limit = 6): Restaurant[] {
  const mine = tokens(place.cuisine_type);
  const myParents = new Set(mine.map(parentOf).filter(Boolean) as string[]);

  return all
    .filter((r) => r.id !== place.id)
    .map((r) => {
      const theirs = tokens(r.cuisine_type);
      const exact = theirs.some((t) => mine.includes(t));
      const related = theirs.some((t) => {
        const p = parentOf(t);
        return p != null && myParents.has(p);
      });
      return { r, score: exact ? 2 : related ? 1 : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.r.rating - a.r.rating || a.r.name.localeCompare(b.r.name, "cs"))
    .slice(0, limit)
    .map((x) => x.r);
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

function distanceKm(a: Cafe, b: Cafe): number {
  const pointsOf = (c: Cafe) => Object.values(c.coordinates ?? {});
  let best = Infinity;
  for (const p of pointsOf(a)) {
    for (const q of pointsOf(b)) {
      const dLat = toRad(q.lat - p.lat);
      const dLng = toRad(q.lng - p.lng);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(p.lat)) * Math.cos(toRad(q.lat)) * Math.sin(dLng / 2) ** 2;
      best = Math.min(best, 12742 * Math.asin(Math.sqrt(h)));
    }
  }
  return best;
}

const areas = (c: Cafe) => c.location.split(",").map((l) => l.trim().toLowerCase()).filter(Boolean);

// Same category set first, then partial overlap; within each group the same
// neighbourhood first, then nearest, then best rated. A cafe with no categories
// of its own just gets its nearest neighbours.
export function similarCafes(place: Cafe, all: Cafe[], limit = 6): Cafe[] {
  const mine = place.tags ?? [];
  const myAreas = areas(place);

  return all
    .filter((c) => c.id !== place.id)
    .map((c) => {
      const theirs = c.tags ?? [];
      const shared = theirs.filter((t) => mine.includes(t)).length;
      const sameSet = mine.length > 0 && shared === mine.length && theirs.length === mine.length;
      return {
        c,
        shared,
        tier: mine.length === 0 ? 0 : sameSet ? 0 : 1,
        sameArea: areas(c).some((a) => myAreas.includes(a)),
        km: distanceKm(place, c),
      };
    })
    .filter((x) => mine.length === 0 || x.shared > 0)
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        Number(b.sameArea) - Number(a.sameArea) ||
        a.km - b.km ||
        (b.c.rating ?? 0) - (a.c.rating ?? 0) ||
        a.c.name.localeCompare(b.c.name, "cs")
    )
    .slice(0, limit)
    .map((x) => x.c);
}
