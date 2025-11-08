"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantFilter from "@/components/RestaurantFilter";
import QuickFilters from "@/components/QuickFilters";
import TrendingCard from "@/components/TrendingCard";
import { Restaurant, Trending, cuisineMatchesFilter, CUISINE_HIERARCHY } from "@/lib/types";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [trendings, setTrendings] = useState<Trending[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCuisineType, setSelectedCuisineType] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("name");

  // Fetch restaurants, trendings, and filters
  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantsRes, trendingsRes, filtersRes] = await Promise.all([
          fetch("/api/restaurants"),
          fetch("/api/trendings"),
          fetch("/api/restaurants/filters"),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const trendingsData = await trendingsRes.json();
        const filtersData = await filtersRes.json();

        // Validate that restaurantsData is an array
        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
          setFilteredRestaurants(restaurantsData);
        } else {
          console.error("Restaurants data is not an array:", restaurantsData);
          setRestaurants([]);
          setFilteredRestaurants([]);
        }

        // Validate that trendingsData is an array
        if (Array.isArray(trendingsData)) {
          setTrendings(trendingsData);
        } else {
          console.error("Trendings data is not an array:", trendingsData);
          setTrendings([]);
        }

        // Validate filters data
        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
        }
        if (filtersData && Array.isArray(filtersData.cuisineTypes)) {
          setAllCuisineTypes(filtersData.cuisineTypes);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate available filter options based on current selection using useMemo
  const getOptionsFromRestaurants = useCallback((restaurantList: Restaurant[]) => {
    const locationSet = new Set<string>();
    const cuisineSet = new Set<string>();

    restaurantList.forEach((r) => {
      // Split and normalize locations
      r.location.split(',').forEach((loc: string) => {
        const normalized = loc.trim().charAt(0).toUpperCase() + loc.trim().slice(1).toLowerCase();
        if (normalized) locationSet.add(normalized);
      });

      // Split and normalize cuisine types
      r.cuisine_type.split(',').forEach((type: string) => {
        const normalized = type.trim().charAt(0).toUpperCase() + type.trim().slice(1).toLowerCase();
        if (normalized) cuisineSet.add(normalized);
      });
    });

    // Add parent categories to cuisine types only if they have matching subcategories or direct match
    Object.entries(CUISINE_HIERARCHY).forEach(([category, subcuisines]) => {
      const hasMatchingRestaurant = restaurantList.some(r => {
        const types = r.cuisine_type.split(',').map((t: string) => t.trim().toLowerCase());
        return types.some((t: string) => {
          // Check for direct match with parent category
          if (t === category.toLowerCase()) {
            return true;
          }
          // Check for subcategory match
          return subcuisines.some(sub => t.includes(sub));
        });
      });
      if (hasMatchingRestaurant) {
        cuisineSet.add(category);
      }
    });

    return {
      locations: Array.from(locationSet).sort((a, b) => a.localeCompare(b, 'cs')),
      cuisineTypes: Array.from(cuisineSet).sort((a, b) => a.localeCompare(b, 'cs')),
    };
  }, []);

  const availableLocations = useMemo(() => {
    // If cuisine type is selected, show only locations that have that cuisine
    if (selectedCuisineType) {
      const filtered = restaurants.filter((r) => {
        const cuisineTypes = r.cuisine_type.split(',').map((type: string) => type.trim());
        return cuisineTypes.some((type: string) => cuisineMatchesFilter(type, selectedCuisineType));
      });
      const options = getOptionsFromRestaurants(filtered);
      return options.locations;
    }
    // Otherwise show all locations
    return allLocations;
  }, [selectedCuisineType, restaurants, allLocations, getOptionsFromRestaurants]);

  const availableCuisineTypes = useMemo(() => {
    // If location is selected, show only cuisine types available in that location
    if (selectedLocation) {
      const filtered = restaurants.filter((r) => {
        const locations = r.location.split(',').map((loc: string) => loc.trim().toLowerCase());
        return locations.some((loc: string) => loc === selectedLocation.toLowerCase());
      });
      const options = getOptionsFromRestaurants(filtered);

      // Filter to only show categories and specific types that actually exist
      return options.cuisineTypes.filter(cuisineType => {
        // Check if this is a parent category
        if (CUISINE_HIERARCHY[cuisineType]) {
          // Only include parent category if there are restaurants matching its subcategories or direct match
          const subcuisines = CUISINE_HIERARCHY[cuisineType];
          return filtered.some(r => {
            const types = r.cuisine_type.split(',').map((t: string) => t.trim().toLowerCase());
            return types.some((t: string) => {
              // Check for direct match with parent category
              if (t === cuisineType.toLowerCase()) {
                return true;
              }
              // Check for subcategory match
              return subcuisines.some(sub => t.includes(sub));
            });
          });
        }
        // Include specific types that exist in filtered restaurants
        return filtered.some(r => {
          const types = r.cuisine_type.split(',').map((t: string) => t.trim().toLowerCase());
          return types.some((t: string) => t === cuisineType.toLowerCase());
        });
      });
    }
    // Otherwise show all cuisine types
    return allCuisineTypes;
  }, [selectedLocation, restaurants, allCuisineTypes, getOptionsFromRestaurants]);

  // Apply filters
  useEffect(() => {
    let filtered = restaurants;

    if (selectedLocation) {
      filtered = filtered.filter((r) => {
        // Split by comma and check if any part matches (case-insensitive)
        const locations = r.location.split(',').map(loc => loc.trim().toLowerCase());
        return locations.some(loc => loc === selectedLocation.toLowerCase());
      });
    }

    if (selectedCuisineType) {
      filtered = filtered.filter((r) => {
        // Split by comma and check if any part matches using hierarchy
        const cuisineTypes = r.cuisine_type.split(',').map((type: string) => type.trim());
        return cuisineTypes.some((type: string) => cuisineMatchesFilter(type, selectedCuisineType));
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    setFilteredRestaurants(filtered);
  }, [selectedLocation, selectedCuisineType, restaurants, sortBy]);

  const handleReset = () => {
    setSelectedLocation("");
    setSelectedCuisineType("");
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-purple-400 tracking-wide">Pojď sem! Kam jdeš?</h1>
          <p className="text-lg text-gray-400">
            Výčet nejlepších restaurací v Praze dle{" "}
            <a
              href="https://www.instagram.com/pecu_si_zivot/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              @Peču si život
            </a>
          </p>
          <p className="text-lg text-gray-400 mt-2">Načítám restaurace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-4 mb-4">
            <h1 className="text-5xl font-bold mb-2 text-purple-400 tracking-widest">Pojď sem! Kam jdeš?</h1>
          </div>
          <p className="text-lg text-gray-300 mt-6">
            Výčet nejlepších restaurací v Praze dle{" "}
            <a
              href="https://www.instagram.com/pecu_si_zivot/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              @Peču si život
            </a>
          </p>
        </div>

        {/* Trendings Section */}
        {trendings.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-purple-400 tracking-wide mb-2">🔥 TOP 10 Trendy</h2>
              <p className="text-gray-400">Nejaktuálnější a nejžhavější podniky</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendings.map((trending, index) => (
                <TrendingCard key={trending.id} trending={trending} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <RestaurantFilter
          locations={availableLocations}
          cuisineTypes={availableCuisineTypes}
          selectedLocation={selectedLocation}
          selectedCuisineType={selectedCuisineType}
          onLocationChange={setSelectedLocation}
          onCuisineTypeChange={setSelectedCuisineType}
          onReset={handleReset}
        />

        {/* Quick Filters */}
        <QuickFilters
          selectedCuisineType={selectedCuisineType}
          onCuisineTypeChange={setSelectedCuisineType}
          restaurants={restaurants}
        />

        {/* Sort and count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-400 text-sm">
            Nalezeno <span className="font-semibold text-purple-400">{filteredRestaurants.length}</span> restaurací
          </p>

          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-gray-400">
              Řadit podle:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-4 pr-12 py-2 border border-purple-600 rounded-md text-sm bg-black text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="rating">Hodnocení</option>
              <option value="price">Ceny</option>
              <option value="name">Názvu</option>
            </select>
          </div>
        </div>

        {/* Restaurant grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-8">Žádné restaurace nenalezeny</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50"
            >
              Vymazat filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}

        {/* Footer link to admin */}
        <div className="mt-16 pt-8 border-t border-purple-900/30 text-center">
          <a
            href="/admin"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300 tracking-wide"
          >
            Přihlásit se do administrace
          </a>
        </div>
      </div>
    </main>
  );
}
