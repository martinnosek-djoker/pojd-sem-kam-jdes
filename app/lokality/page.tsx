import { getAllRestaurants, getUniqueLocations } from "@/lib/db";
import LocalitiesPageClient from "./LocalitiesPageClient";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function LocalitiesPage() {
  const [restaurants, locations] = await Promise.all([
    getAllRestaurants(),
    getUniqueLocations(),
  ]);

  return <LocalitiesPageClient initialRestaurants={restaurants} initialLocations={locations} />;
}
