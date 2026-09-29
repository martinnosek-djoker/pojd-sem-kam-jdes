import HomePage from '@/components/HomePage';
import { getAllRestaurants, getUniqueLocations, getUniqueCuisineTypes, getRecentVisits } from '@/lib/db';

export const metadata = {
  title: "Nejlepší restaurace, kavárny a cukrárny v Praze",
  description: "Objevte nejlepší gastro místa v Praze s osobními doporučeními od @Peču si život. Filtrujte podle lokality, typu kuchyně nebo najděte podniky ve vašem okolí. Restaurace, prémiové kavárny a skvělé cukrárny na jednom místě.",
  openGraph: {
    title: "Nejlepší restaurace, kavárny a cukrárny v Praze | Osobní doporučení",
    description: "Objevte nejlepší gastro místa v Praze. Filtrujte podle lokality, typu kuchyně nebo najděte podniky ve vašem okolí. Doporučení od @Peču si život.",
  },
};

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function Home() {
  const [restaurants, locations, cuisineTypes, visits] = await Promise.all([
    getAllRestaurants(),
    getUniqueLocations(),
    getUniqueCuisineTypes(),
    getRecentVisits(10),
  ]);

  return (
    <HomePage
      initialRestaurants={restaurants}
      initialLocations={locations}
      initialCuisineTypes={cuisineTypes}
      initialVisits={visits}
    />
  );
}
