"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import { Restaurant } from "@/lib/types";
import { mapLocationToGroup } from "@/lib/location-groups";

interface LocalitiesClientProps {
  restaurants: Restaurant[];
  allLocations: string[];
}

export default function LocalitiesClient({ restaurants, allLocations }: LocalitiesClientProps) {
  const t = useTranslations("locations");
  const [scrollIndices, setScrollIndices] = useState<Record<string, number>>({});

  // Group restaurants by location
  const restaurantsByLocation = useMemo(() => {
    const grouped: Record<string, Restaurant[]> = {};

    restaurants.forEach((restaurant) => {
      const locations = restaurant.location
        .split(',')
        .map(loc => mapLocationToGroup(loc));

      locations.forEach((groupName) => {
        if (!grouped[groupName]) {
          grouped[groupName] = [];
        }
        grouped[groupName].push(restaurant);
      });
    });

    // Sort restaurants within each location by rating
    Object.keys(grouped).forEach((location) => {
      grouped[location].sort((a, b) => b.rating - a.rating);
    });

    return grouped;
  }, [restaurants]);

  const handleScroll = (location: string, e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setScrollIndices(prev => ({ ...prev, [location]: index }));
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">{t("pageTitle")}</h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">{t("pageSubtitle")}</p>
        </div>

        {allLocations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">{t("noLocations")}</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {allLocations.map((location) => {
              const locationRestaurants = restaurantsByLocation[location] || [];
              const count = locationRestaurants.length;

              if (count === 0) return null;

              let countText;
              if (count === 1) {
                countText = t("restaurant");
              } else if (count >= 2 && count <= 4) {
                countText = t("restaurantCount");
              } else {
                countText = t("restaurantsMany");
              }

              return (
                <div key={location} className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold text-purple-400 flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <span>{location}</span>
                    <span className="text-base md:text-lg text-gray-400 font-normal">
                      ({count} {countText})
                    </span>
                  </h2>

                  <div className="md:hidden relative">
                    <div
                      onScroll={(e) => handleScroll(location, e)}
                      className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                    >
                      {locationRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="flex-shrink-0 w-[85%] snap-start">
                          <RestaurantCard restaurant={restaurant} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {locationRestaurants.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                            index === (scrollIndices[location] || 0) ? 'bg-purple-400' : 'bg-purple-500/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locationRestaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
