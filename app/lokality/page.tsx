"use client";

import { useEffect, useState, useMemo } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import { Restaurant } from "@/lib/types";

export default function LocalitiesPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantsRes, filtersRes] = await Promise.all([
          fetch("/api/restaurants"),
          fetch("/api/restaurants/filters"),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const filtersData = await filtersRes.json();

        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
        }

        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Group restaurants by location
  const restaurantsByLocation = useMemo(() => {
    const grouped: Record<string, Restaurant[]> = {};

    restaurants.forEach((restaurant) => {
      const locations = restaurant.location.split(',').map(loc => loc.trim());

      locations.forEach((loc) => {
        if (!grouped[loc]) {
          grouped[loc] = [];
        }
        grouped[loc].push(restaurant);
      });
    });

    // Sort restaurants within each location alphabetically by name
    Object.keys(grouped).forEach((loc) => {
      grouped[loc].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
    });

    return grouped;
  }, [restaurants]);

  // Get sorted locations with restaurant counts (alphabetically)
  const sortedLocations = useMemo(() => {
    return allLocations
      .map((loc) => ({
        name: loc,
        count: restaurantsByLocation[loc]?.length || 0,
      }))
      .filter((loc) => loc.count >= 3)
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [allLocations, restaurantsByLocation]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Logo />
          </div>
          <p className="text-lg text-gray-400 text-center">Načítám lokality...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-6 mb-4">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold text-purple-400 mt-6 mb-2">📍 Restaurace v okolí</h1>
          <p className="text-lg text-gray-300">
            Objevte nejlepší restaurace podle lokalit v Praze
          </p>
        </div>

        {/* All Locations with Carousels */}
        <div className="space-y-12">
          {sortedLocations.map((location) => (
            <div key={location.name}>
              {/* Location Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-purple-400 mb-2">
                  {location.name}
                </h2>
                <p className="text-gray-400">
                  {location.count} {location.count === 1 ? "restaurace" : location.count < 5 ? "restaurace" : "restaurací"}
                </p>
              </div>

              {/* Horizontal Scrolling Cards */}
              <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                  {/* Invisible spacer for left padding on mobile */}
                  <div className="flex-shrink-0 w-0 sm:hidden" aria-hidden="true"></div>
                  {restaurantsByLocation[location.name]?.map((restaurant) => (
                    <div key={restaurant.id} className="flex-shrink-0 w-[85%] sm:w-80">
                      <RestaurantCard restaurant={restaurant} />
                    </div>
                  ))}
                  {/* Invisible spacer for right padding on mobile */}
                  <div className="flex-shrink-0 w-0 sm:hidden" aria-hidden="true"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedLocations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              Zatím nejsou k dispozici žádné lokality
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
