"use client";

import { useEffect, useState, useMemo } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import { Restaurant, cuisineMatchesFilter } from "@/lib/types";

// Emoji mapping for different cuisine types
const CUISINE_EMOJIS: Record<string, string> = {
  "Pizza": "🍕",
  "Pizzeria": "🍕",
  "Italska": "🇮🇹",
  "Burger": "🍔",
  "Asijska": "🥢",
  "Vietnamska": "🇻🇳",
  "Indicka": "🇮🇳",
  "Thajska": "🇹🇭",
  "Cinska": "🇨🇳",
  "Japonska": "🇯🇵",
  "Korejska": "🇰🇷",
  "Ceska": "🇨🇿",
  "Mexicka": "🇲🇽",
  "Sushi": "🍣",
  "Bbq": "🍖",
  "Steak": "🥩",
  "Gril": "🔥",
  "Vegan": "🌱",
  "Vegetarian": "🥗",
};

function getCuisineEmoji(cuisine: string): string {
  const normalized = cuisine.toLowerCase();
  for (const [key, emoji] of Object.entries(CUISINE_EMOJIS)) {
    if (normalized.includes(key.toLowerCase())) {
      return emoji;
    }
  }
  return "🍽️"; // Default emoji
}

export default function CuisinesPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>([]);
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

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Logo />
          </div>
          <p className="text-lg text-gray-400 text-center">Načítám kuchyně...</p>
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
          <h1 className="text-4xl font-bold text-purple-400 mt-6 mb-2">🌍 Světové kuchyně</h1>
          <p className="text-lg text-gray-300">
            Objevte restaurace podle typu kuchyně
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
              <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                  {restaurantsByCuisine[cuisine.name]?.map((restaurant) => (
                    <div key={restaurant.id} className="flex-shrink-0 w-80">
                      <RestaurantCard restaurant={restaurant} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedCuisines.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              Zatím nejsou k dispozici žádné typy kuchyní
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
