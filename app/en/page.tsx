import HomePage from "@/components/HomePage";
import { getAllRestaurants, getUniqueLocations, getUniqueCuisineTypes, getRecentVisits } from "@/lib/db";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function EnglishHome() {
  const [restaurants, locations, cuisineTypes, visits] = await Promise.all([
    getAllRestaurants(),
    getUniqueLocations(),
    getUniqueCuisineTypes(),
    getRecentVisits(10),
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
