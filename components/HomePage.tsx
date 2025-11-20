"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantFilter from "@/components/RestaurantFilter";
import QuickFilters from "@/components/QuickFilters";
import TrendingCard from "@/components/TrendingCard";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import { Restaurant, Trending, cuisineMatchesFilter, CUISINE_HIERARCHY } from "@/lib/types";
import { normalizeLocationName } from "@/lib/location-utils";
import { getApiUrl } from "@/lib/api-config";

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
  const [trendingScrollIndex, setTrendingScrollIndex] = useState(0);
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  // Fetch restaurants, trendings, and filters
  useEffect(() => {
    async function fetchData() {
      try {
        const restaurantsUrl = getApiUrl("/api/restaurants");
        const trendingsUrl = getApiUrl("/api/trendings");
        const filtersUrl = getApiUrl("/api/restaurants/filters");

        console.log("[HomePage] 🔍 Fetching restaurants from:", restaurantsUrl);
        console.log("[HomePage] 🔍 Fetching trendings from:", trendingsUrl);
        console.log("[HomePage] 🔍 Fetching filters from:", filtersUrl);

        const [restaurantsRes, trendingsRes, filtersRes] = await Promise.all([
          fetch(restaurantsUrl),
          fetch(trendingsUrl),
          fetch(filtersUrl),
        ]);

        console.log("[HomePage] ✅ Response status - restaurants:", restaurantsRes.status);
        console.log("[HomePage] ✅ Response status - trendings:", trendingsRes.status);
        console.log("[HomePage] ✅ Response status - filters:", filtersRes.status);

        const restaurantsData = await restaurantsRes.json();
        const trendingsData = await trendingsRes.json();
        const filtersData = await filtersRes.json();

        console.log("[HomePage] Received data:", {
          restaurantsCount: Array.isArray(restaurantsData) ? restaurantsData.length : 'not an array',
          trendingsCount: Array.isArray(trendingsData) ? trendingsData.length : 'not an array',
          filtersLocations: Array.isArray(filtersData?.locations) ? filtersData.locations.length : 'not an array',
          filtersCuisineTypes: Array.isArray(filtersData?.cuisineTypes) ? filtersData.cuisineTypes.length : 'not an array'
        });

        // Validate that restaurantsData is an array
        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
          setFilteredRestaurants(restaurantsData);
          console.log("[HomePage] ✅ Set restaurants:", restaurantsData.length);
        } else {
          console.error("[HomePage] ❌ Restaurants data is not an array:", restaurantsData);
          setRestaurants([]);
          setFilteredRestaurants([]);
        }

        // Validate that trendingsData is an array
        if (Array.isArray(trendingsData)) {
          setTrendings(trendingsData);
          console.log("[HomePage] ✅ Set trendings:", trendingsData.length);
        } else {
          console.error("[HomePage] ❌ Trendings data is not an array:", trendingsData);
          setTrendings([]);
        }

        // Validate filters data
        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
          console.log("[HomePage] ✅ Set locations:", filtersData.locations.length);
        }
        if (filtersData && Array.isArray(filtersData.cuisineTypes)) {
          setAllCuisineTypes(filtersData.cuisineTypes);
          console.log("[HomePage] ✅ Set cuisineTypes:", filtersData.cuisineTypes.length);
        }
      } catch (error) {
        console.error("[HomePage] ❌ Error fetching data:", error);
        console.error("[HomePage] ❌ Error name:", error instanceof Error ? error.name : 'Unknown');
        console.error("[HomePage] ❌ Error message:", error instanceof Error ? error.message : 'Unknown');
        console.error("[HomePage] ❌ Error stack:", error instanceof Error ? error.stack : 'Unknown');
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
        console.log("[HomePage] Loading complete");
      }
    }

    fetchData();
  }, []);

  // Calculate available filter options based on current selection using useMemo
  const getOptionsFromRestaurants = useCallback((restaurantList: Restaurant[]) => {
    const locationSet = new Set<string>();
    const cuisineSet = new Set<string>();

    restaurantList.forEach((r) => {
      // Split and normalize locations with proper Czech capitalization
      r.location.split(',').forEach((loc: string) => {
        const trimmed = loc.trim();
        if (trimmed) {
          const normalized = normalizeLocationName(trimmed);
          locationSet.add(normalized);
        }
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
    // Otherwise show locations from all restaurants (not from API)
    const options = getOptionsFromRestaurants(restaurants);
    return options.locations;
  }, [selectedCuisineType, restaurants, getOptionsFromRestaurants]);

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
        // Split by comma, normalize with proper Czech capitalization and check match (case-insensitive)
        const locations = r.location
          .split(',')
          .map(loc => normalizeLocationName(loc.trim()));
        return locations.some(loc => loc.toLowerCase() === selectedLocation.toLowerCase());
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

  const handleTrendingScroll = () => {
    if (!trendingScrollRef.current) return;
    const scrollLeft = trendingScrollRef.current.scrollLeft;
    const cardWidth = trendingScrollRef.current.offsetWidth * 0.85 + 16; // 85% width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setTrendingScrollIndex(index);
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
          <p className="text-sm md:text-lg text-gray-300 mt-2 md:mt-6 hidden sm:block">
            Osobní doporučení nejlepších restaurací, kaváren a cukráren v Praze od{" "}
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
          <div className="mb-8 md:mb-12">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-wide mb-1 md:mb-2">🔥 TOP 10 podniků, o kterých se dnes mluví</h2>
              <p className="text-sm md:text-base text-gray-400">Nejžhavější tipy a trendy v pražské gastronomii</p>
            </div>
            {/* Mobile: Horizontal Carousel */}
            <div className="md:hidden relative">
              <div
                ref={trendingScrollRef}
                onScroll={handleTrendingScroll}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              >
                {trendings.map((trending, index) => (
                  <div key={trending.id} className="flex-shrink-0 w-[85%] snap-start snap-always">
                    <TrendingCard trending={trending} rank={index + 1} />
                  </div>
                ))}
              </div>
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-2">
                {trendings.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      index === trendingScrollIndex ? 'bg-purple-400' : 'bg-purple-500/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
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
              Seřadit:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-4 pr-12 py-2 border border-purple-600 rounded-md text-sm bg-black text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="rating">Podle hodnocení</option>
              <option value="price">Podle ceny</option>
              <option value="name">Podle názvu</option>
            </select>
          </div>
        </div>

        {/* Restaurant grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-8">Nebyly nalezeny žádné restaurace</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50"
            >
              Resetovat filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
