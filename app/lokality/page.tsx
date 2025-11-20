"use client";

import { useEffect, useState, useMemo } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import { Restaurant } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function LocalitiesPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndices, setScrollIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantsRes, filtersRes] = await Promise.all([
          fetch(getApiUrl("/api/restaurants")),
          fetch(getApiUrl("/api/restaurants/filters")),
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

  const handleScroll = (locationName: string, event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollLeft = target.scrollLeft;
    const cardWidth = target.offsetWidth * 0.85 + 24; // 85% width + gap (6 * 4px = 24px)
    const index = Math.round(scrollLeft / cardWidth);
    setScrollIndices(prev => ({ ...prev, [locationName]: index }));
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Logo />
          </div>
          <LoadingPot />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">Podle lokality</h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            Nejlepší restaurace v Praze roztříděné podle lokality
          </p>
        </div>

        {/* All Locations with Carousels */}
        <div className="space-y-8 md:space-y-12">
          {sortedLocations.map((location) => (
            <div key={location.name}>
              {/* Location Header */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-purple-400 mb-2 flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <span>{location.name}</span>
                </h2>
                <p className="text-gray-400">
                  {location.count} {location.count === 1 ? "restaurace" : location.count < 5 ? "restaurace" : "restaurací"}
                </p>
              </div>

              {/* Horizontal Scrolling Cards */}
              <div className="relative sm:mx-0">
                <div
                  onScroll={(e) => handleScroll(location.name, e)}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide sm:scrollbar-thin snap-x snap-mandatory"
                >
                  {restaurantsByLocation[location.name]?.map((restaurant) => (
                    <div key={restaurant.id} className="flex-shrink-0 w-[85%] sm:w-80 snap-start snap-always">
                      <RestaurantCard restaurant={restaurant} />
                    </div>
                  ))}
                </div>
                {/* Progress indicator - mobile only */}
                <div className="sm:hidden flex justify-center gap-1.5 mt-2">
                  {restaurantsByLocation[location.name]?.slice(0, Math.min(10, restaurantsByLocation[location.name].length)).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        index === (scrollIndices[location.name] || 0) ? 'bg-purple-400' : 'bg-purple-500/30'
                      }`}
                    />
                  ))}
                  {restaurantsByLocation[location.name]?.length > 10 && (
                    <span className="text-xs text-purple-400 ml-1">+{restaurantsByLocation[location.name].length - 10}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedLocations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              Nebyly nalezeny žádné lokality s dostatečným počtem restaurací
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
