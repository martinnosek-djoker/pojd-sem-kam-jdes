import LocalitiesClient from "./LocalitiesClient";
import { getAllRestaurants, getUniqueLocations } from "@/lib/db";

export default async function LocalitiesPage() {
  // Fetch data server-side directly from database
  try {
    const [restaurants, allLocations] = await Promise.all([
      getAllRestaurants(),
      getUniqueLocations(),
    ]);

    return <LocalitiesClient restaurants={restaurants} allLocations={allLocations} />;
  } catch (error) {
    console.error('Error in LocalitiesPage:', error);
    return <LocalitiesClient restaurants={[]} allLocations={[]} />;
  }
}
