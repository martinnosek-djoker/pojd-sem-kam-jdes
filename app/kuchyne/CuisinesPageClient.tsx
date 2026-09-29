"use client";

import { useEffect, useMemo, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import { Restaurant, cuisineMatchesFilter } from "@/lib/types";
import { getApiUrl, IS_MOBILE } from "@/lib/api-config";

// Helper function to normalize strings for comparison (removes diacritics)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
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

interface CuisinesPageClientProps {
  initialRestaurants: Restaurant[];
  initialCuisineTypes: string[];
}

export default function CuisinesPageClient({ initialRestaurants, initialCuisineTypes }: CuisinesPageClientProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>(initialCuisineTypes);
  const [scrollIndices, setScrollIndices] = useState<Record<string, number>>({});

  // In the native app, refresh with a live fetch after the initial (build-time) data paints,
  // since a static mobile build can otherwise go stale between app releases.
  useEffect(() => {
    if (!IS_MOBILE) return;

    async function refreshData() {
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
        console.error("[CuisinesPageClient] Error refreshing data:", error);
      }
    }

    refreshData();
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

  return (
    <main className="min-h-screen px-8 pb-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-12 text-center">
          <div className="inline-block border-b-2 border-hairline pb-6 mb-4">
            <Logo />
          </div>
          <h1 className="text-4xl font-serif font-bold text-ink mt-6 mb-2">Světové kuchyně</h1>
          <p className="text-lg text-text-muted">
            Najdi nejlepší restaurace podle typu kuchyně
          </p>
        </div>

        {/* All Cuisines with Carousels */}
        <div className="space-y-12">
          {sortedCuisines.map((cuisine) => (
            <div key={cuisine.name}>
              {/* Cuisine Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold text-ink mb-2">
                  {cuisine.emoji} {cuisine.name}
                </h2>
                <p className="text-text-muted">
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
                        index === (scrollIndices[cuisine.name] || 0) ? 'bg-terracotta' : 'bg-hairline'
                      }`}
                    />
                  ))}
                  {restaurantsByCuisine[cuisine.name]?.length > 10 && (
                    <span className="text-xs text-terracotta ml-1">+{restaurantsByCuisine[cuisine.name].length - 10}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedCuisines.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-text-muted">
              Nebyly nalezeny žádné kuchyně
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
