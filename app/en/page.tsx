import HomePage from "@/components/HomePage";
import { getAllRestaurants, getUniqueLocations, getUniqueCuisineTypes, getRecentVisits } from "@/lib/db";
import { IS_STATIC_APP } from "@/lib/slug";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function EnglishHome() {
  const [restaurants, locations, cuisineTypes, visits] = await Promise.all([
    getAllRestaurants(),
    getUniqueLocations(),
    getUniqueCuisineTypes(),
    // The native app is a static export: visits baked in at build time are stale on the very first
    // paint (wrong newest review, replaced a moment later), so the app loads them live instead.
    IS_STATIC_APP ? Promise.resolve([]) : getRecentVisits(10),
  ]);

  return (
    <HomePage
      locale="en"
      initialRestaurants={restaurants}
      initialLocations={locations}
      initialCuisineTypes={cuisineTypes}
      initialVisits={visits}
    />
  );
}
