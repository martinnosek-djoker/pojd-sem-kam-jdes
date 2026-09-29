import { getAllRestaurants, getUniqueCuisineTypes } from "@/lib/db";
import CuisinesPageClient from "@/app/kuchyne/CuisinesPageClient";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function EnglishCuisinesPage() {
  const [restaurants, cuisineTypes] = await Promise.all([
    getAllRestaurants(),
    getUniqueCuisineTypes(),
  ]);

  return <CuisinesPageClient locale="en" initialRestaurants={restaurants} initialCuisineTypes={cuisineTypes} />;
}
