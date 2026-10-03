import { getAllRestaurants, getAllCafes } from "@/lib/db";
import NearbyPageClient from "./NearbyPageClient";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function NearbyPage() {
  const [restaurants, cafes] = await Promise.all([
    getAllRestaurants(),
    getAllCafes(),
  ]);

  return (
    <NearbyPageClient
      initialRestaurants={restaurants}
      initialCafes={cafes}
    />
  );
}
