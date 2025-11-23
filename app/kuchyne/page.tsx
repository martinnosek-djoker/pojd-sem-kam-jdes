"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import { Restaurant, cuisineMatchesFilter } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

// Helper function to normalize strings for comparison (removes diacritics)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Emoji mapping for different cuisine types
const CUISINE_EMOJIS: Record<string, string> = {
  // Vlajky národností (bez diakritiky pro matching)
  "italska": "🇮🇹",
  "ceska": "🇨🇿",
  "mexicka": "🇲🇽",
  "vietnamska": "🇻🇳",
  "indicka": "🇮🇳",
  "thajska": "🇹🇭",
  "cinska": "🇨🇳",
  "japonska": "🇯🇵",
  "korejska": "🇰🇷",
  "americka": "🇺🇸",
  "francouzska": "🇫🇷",
  "spanelska": "🇪🇸",
  "grecka": "🇬🇷",
  "turecka": "🇹🇷",
  "brazilska": "🇧🇷",
  "argentina": "🇦🇷",
  "peruana": "🇵🇪",

  // Specifické pokrmy
  "pizza": "🍕",
  "pizzeria": "🍕",
  "burger": "🍔",
  "sushi": "🍣",
  "ramen": "🍜",
  "pasta": "🍝",
  "taco": "🌮",
  "burrito": "🌯",
  "kebab": "🥙",
  "curry": "🍛",

  // Kategorie
  "asijska": "🥢",
  "maso": "🥩",
  "steak": "🥩",
  "bbq": "🍖",
  "gril": "🔥",
  "seafood": "🦞",
  "ryby": "🐟",
  "vegan": "🌱",
  "vegetarian": "🥗",
  "dezerty": "🍰",
  "cukrarna": "🧁",
  "street": "🍟",
  "fast": "🍟",
  "fine": "🍷",
  "bistro": "☕",
  "cafe": "☕",
};

function getCuisineEmoji(cuisine: string): string {
  const normalized = normalizeString(cuisine);

  // Try exact match first
  if (CUISINE_EMOJIS[normalized]) {
    return CUISINE_EMOJIS[normalized];
  }

  // Try substring match
  for (const [key, emoji] of Object.entries(CUISINE_EMOJIS)) {
    if (normalized.includes(key)) {
      return emoji;
    }
  }

  return "🍽️"; // Default emoji
}

export default function CuisinesPage() {
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>([]);
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

        if (filtersData && Array.isArray(filtersData.cuisineTypes)) {
          setAllCuisineTypes(filtersData.cuisineTypes);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Group restaurants by cuisine type
  const restaurantsByCuisine = useMemo(() => {
    const grouped: Record<string, Restaurant[]> = {};

    allCuisineTypes.forEach((cuisineType) => {
      const matching = restaurants.filter((restaurant) => {
        const cuisineTypes = restaurant.cuisine_type.split(',').map((type: string) => type.trim());
        return cuisineTypes.some((type: string) => cuisineMatchesFilter(type, cuisineType));
      });

      if (matching.length > 0) {
        grouped[cuisineType] = matching.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
      }
    });

    return grouped;
  }, [restaurants, allCuisineTypes]);

  // Get sorted cuisines with restaurant counts (alphabetically)
  const sortedCuisines = useMemo(() => {
    return allCuisineTypes
      .map((cuisine) => ({
        name: cuisine,
        count: restaurantsByCuisine[cuisine]?.length || 0,
        emoji: getCuisineEmoji(cuisine),
      }))
      .filter((cuisine) => cuisine.count >= 3)
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [allCuisineTypes, restaurantsByCuisine]);

  const handleScroll = (cuisineName: string, event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollLeft = target.scrollLeft;
    const cardWidth = target.offsetWidth * 0.85 + 24; // 85% width + gap (6 * 4px = 24px)
    const index = Math.round(scrollLeft / cardWidth);
    setScrollIndices(prev => ({ ...prev, [cuisineName]: index }));
  };

  if (loading) {
    return (
      <main className="min-h-screen px-8 pb-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="pt-6 md:pt-8 mb-8">
            <Logo />
          </div>
          <LoadingPot />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 pb-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-6 md:pt-8 mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-6 mb-4">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold text-purple-400 mt-6 mb-2">Světové kuchyně</h1>
          <p className="text-lg text-gray-300">
            Najdi nejlepší restaurace podle typu kuchyně
          </p>
        </div>

        {/* All Cuisines with Carousels */}
        <div className="space-y-12">
          {sortedCuisines.map((cuisine) => (
            <div key={cuisine.name}>
              {/* Cuisine Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-purple-400 mb-2">
                  {cuisine.emoji} {cuisine.name}
                </h2>
                <p className="text-gray-400">
                  {cuisine.count} {cuisine.count === 1 ? "restaurace" : cuisine.count < 5 ? "restaurace" : "restaurací"}
                </p>
              </div>

              {/* Horizontal Scrolling Cards */}
              <div className="relative sm:mx-0">
                <div
                  onScroll={(e) => handleScroll(cuisine.name, e)}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide sm:scrollbar-thin snap-x snap-mandatory"
                >
                  {restaurantsByCuisine[cuisine.name]?.map((restaurant) => (
                    <div key={restaurant.id} className="flex-shrink-0 w-[85%] sm:w-80 snap-start snap-always">
                      <RestaurantCard restaurant={restaurant} />
                    </div>
                  ))}
                </div>
                {/* Progress indicator - mobile only */}
                <div className="sm:hidden flex justify-center gap-1.5 mt-2">
                  {restaurantsByCuisine[cuisine.name]?.slice(0, Math.min(10, restaurantsByCuisine[cuisine.name].length)).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        index === (scrollIndices[cuisine.name] || 0) ? 'bg-purple-400' : 'bg-purple-500/30'
                      }`}
                    />
                  ))}
                  {restaurantsByCuisine[cuisine.name]?.length > 10 && (
                    <span className="text-xs text-purple-400 ml-1">+{restaurantsByCuisine[cuisine.name].length - 10}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedCuisines.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              Nebyly nalezeny žádné kuchyně
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
