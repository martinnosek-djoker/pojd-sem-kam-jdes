import { setRequestLocale } from "next-intl/server";
import LocalitiesClient from "./LocalitiesClient";

export default async function LocalitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch data server-side
  const [restaurantsRes, filtersRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/restaurants`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/restaurants/filters`, { cache: 'no-store' }),
  ]);

  const restaurantsData = await restaurantsRes.json();
  const filtersData = await filtersRes.json();

  const restaurants = Array.isArray(restaurantsData) ? restaurantsData : [];
  const allLocations = filtersData && Array.isArray(filtersData.locations) ? filtersData.locations : [];

  return <LocalitiesClient restaurants={restaurants} allLocations={allLocations} />;
}
