import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth";
import { getAllRestaurants, getAllTrendings, getAllCafes, getAllEvents, getAllVisits } from "@/lib/db";
import { Visit } from "@/lib/types";
import AdminDashboard from "@/components/AdminDashboard";
import TrendingsAdmin from "@/components/TrendingsAdmin";
import CafesAdmin from "@/components/CafesAdmin";
import EventsAdmin from "@/components/EventsAdmin";
import VisitsAdmin from "@/components/VisitsAdmin";
import LogoutButton from "@/components/LogoutButton";

// Only force dynamic on server builds, not on static export for mobile
export const dynamic = process.env.MOBILE_BUILD ? undefined : 'force-dynamic';
export const revalidate = process.env.MOBILE_BUILD ? undefined : 0;

export default async function AdminPage() {
  try {
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
      redirect("/admin/login");
    }

    const [restaurants, trendings, cafes, events] = await Promise.all([
      getAllRestaurants(),
      getAllTrendings(),
      getAllCafes(),
      getAllEvents(),
    ]);

    // Visits table is new/optional - don't let a not-yet-migrated DB break the whole admin page
    let visits: Visit[] = [];
    try {
      visits = await getAllVisits();
    } catch (error) {
      console.error("Visits not available yet (has the migration been run?):", error);
    }

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administrace</h1>
              <p className="text-gray-600 mt-1">
                {restaurants.length} restaurací • {cafes.length} kaváren • {trendings.length} trending podniků • {events.length} akcí • {visits.length} návštěv
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/import"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📤 Import CSV
              </a>
              <LogoutButton />
            </div>
          </div>

          {/* Visits Section */}
          <VisitsAdmin initialVisits={visits} />

          {/* Separator */}
          <div className="my-8 border-t border-gray-300"></div>

          {/* Trendings Section */}
          <TrendingsAdmin initialTrendings={trendings} />

          {/* Separator */}
          <div className="my-8 border-t border-gray-300"></div>

          {/* Restaurants Section */}
          <AdminDashboard initialRestaurants={restaurants} />

          {/* Separator */}
          <div className="my-8 border-t border-gray-300"></div>

          {/* Cafes Section */}
          <CafesAdmin initialCafes={cafes} />

          {/* Separator */}
          <div className="my-8 border-t border-gray-300"></div>

          {/* Events Section */}
          <EventsAdmin initialEvents={events} />

          {/* Footer */}
          <div className="mt-8 text-center">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Zpět na veřejnou stránku
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Admin page error:", error);
    throw error;
  }
}
