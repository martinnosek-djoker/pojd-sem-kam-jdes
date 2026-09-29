import { getAllCafes, getUniqueCafeLocations } from "@/lib/db";
import CafesPageClient from "@/app/kavarny/CafesPageClient";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function EnglishCafesPage() {
  const [cafes, locations] = await Promise.all([
    getAllCafes(),
    getUniqueCafeLocations(),
  ]);

  return <CafesPageClient locale="en" initialCafes={cafes} initialLocations={locations} />;
}
