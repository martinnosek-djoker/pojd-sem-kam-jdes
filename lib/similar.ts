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

export function similarCafes(place: Cafe, all: Cafe[], limit = 6): Cafe[] {
  const mine = place.tags ?? [];
  if (mine.length === 0) return [];

  return all
    .filter((c) => c.id !== place.id)
    .map((c) => ({ c, shared: (c.tags ?? []).filter((t) => mine.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || (b.c.rating ?? 0) - (a.c.rating ?? 0) || a.c.name.localeCompare(b.c.name, "cs"))
    .slice(0, limit)
    .map((x) => x.c);
}
