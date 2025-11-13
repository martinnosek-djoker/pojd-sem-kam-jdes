"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import { Restaurant, cuisineMatchesFilter } from "@/lib/types";

interface CuisinesClientProps {
  restaurants: Restaurant[];
  allCuisineTypes: string[];
}

export default function CuisinesClient({ restaurants, allCuisineTypes }: CuisinesClientProps) {
  const t = useTranslations("cuisines");
  const [scrollIndices, setScrollIndices] = useState<Record<string, number>>({});

  // Group restaurants by cuisine type
  const restaurantsByCuisine = useMemo(() => {
    const grouped: Record<string, Restaurant[]> = {};

    restaurants.forEach((restaurant) => {
      const cuisineTypes = restaurant.cuisine_type.split(',').map(type => type.trim());

      cuisineTypes.forEach((cuisineType) => {
        if (!grouped[cuisineType]) {
          grouped[cuisineType] = [];
        }
        grouped[cuisineType].push(restaurant);
      });
    });

    // Sort restaurants within each cuisine by rating
    Object.keys(grouped).forEach((cuisineType) => {
      grouped[cuisineType].sort((a, b) => b.rating - a.rating);
    });

    return grouped;
  }, [restaurants]);

  const handleScroll = (cuisineType: string, e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setScrollIndices(prev => ({ ...prev, [cuisineType]: index }));
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

        {allCuisineTypes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">{t("noCuisines")}</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {allCuisineTypes.map((cuisineType) => {
              const cuisineRestaurants = restaurantsByCuisine[cuisineType] || [];
              const count = cuisineRestaurants.length;

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
                <div key={cuisineType} className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold text-purple-400 flex items-center gap-3">
                    <span className="text-2xl">🌍</span>
                    <span>{cuisineType}</span>
                    <span className="text-base md:text-lg text-gray-400 font-normal">
                      ({count} {countText})
                    </span>
                  </h2>

                  <div className="md:hidden relative">
                    <div
                      onScroll={(e) => handleScroll(cuisineType, e)}
                      className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                    >
                      {cuisineRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="flex-shrink-0 w-[85%] snap-start">
                          <RestaurantCard restaurant={restaurant} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {cuisineRestaurants.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                            index === (scrollIndices[cuisineType] || 0) ? 'bg-purple-400' : 'bg-purple-500/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cuisineRestaurants.map((restaurant) => (
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
