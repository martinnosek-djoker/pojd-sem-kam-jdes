"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Logo from "@/components/Logo";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantFilter from "@/components/RestaurantFilter";
import QuickFilters from "@/components/QuickFilters";
import FloatingNearbyButton from "@/components/FloatingNearbyButton";
import AIRestaurantSearch from "@/components/AIRestaurantSearch";
import RecentVisits from "@/components/RecentVisits";
import { Restaurant, Visit, cuisineMatchesFilter, CUISINE_HIERARCHY } from "@/lib/types";
import { normalizeLocationName } from "@/lib/location-utils";
import { getApiUrl } from "@/lib/api-config";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCuisineType, setSelectedCuisineType] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("name");

  // Fetch restaurants and filters
  useEffect(() => {
    async function fetchData() {
      try {
        const restaurantsUrl = getApiUrl("/api/restaurants");
        const filtersUrl = getApiUrl("/api/restaurants/filters");
        const visitsUrl = getApiUrl("/api/visits?limit=10");

        const [restaurantsRes, filtersRes, visitsRes] = await Promise.all([
          fetch(restaurantsUrl),
          fetch(filtersUrl),
          fetch(visitsUrl),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const filtersData = await filtersRes.json();
        const visitsData = await visitsRes.json();

        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
          setFilteredRestaurants(restaurantsData);
        }
        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
        }
        if (filtersData && Array.isArray(filtersData.cuisineTypes)) {
          setAllCuisineTypes(filtersData.cuisineTypes);
        }
        if (Array.isArray(visitsData)) {
          setVisits(visitsData);
        }
      } catch (error) {
        console.error("[HomePage] Error fetching data:", error);
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getOptionsFromRestaurants = useCallback((restaurantList: Restaurant[]) => {
    const locationSet = new Set<string>();
    const cuisineSet = new Set<string>();

    restaurantList.forEach((r) => {
      r.location.split(',').forEach((loc: string) => {
        const trimmed = loc.trim();
        if (trimmed) {
          const normalized = normalizeLocationName(trimmed);
          locationSet.add(normalized);
        }
      });

      r.cuisine_type.split(',').forEach((type: string) => {
        const normalized = type.trim().charAt(0).toUpperCase() + type.trim().slice(1).toLowerCase();
        if (normalized) cuisineSet.add(normalized);
      });
    });

    Object.entries(CUISINE_HIERARCHY).forEach(([category, subcuisines]) => {
      const hasMatchingRestaurant = restaurantList.some(r => {
        const types = r.cuisine_type.split(',').map((t: string) => t.trim().toLowerCase());
        return types.some((t: string) => {
          if (t === category.toLowerCase()) return true;
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
    if (selectedCuisineType) {
      const filtered = restaurants.filter((r) => {
        const cuisineTypes = r.cuisine_type.split(',').map((type: string) => type.trim());
        return cuisineTypes.some((type: string) => cuisineMatchesFilter(type, selectedCuisineType));
      });
      const options = getOptionsFromRestaurants(filtered);
      return options.locations;
    }
    const options = getOptionsFromRestaurants(restaurants);
    return options.locations;
  }, [selectedCuisineType, restaurants, getOptionsFromRestaurants]);

  const availableCuisineTypes = useMemo(() => {
    if (selectedLocation) {
      const filtered = restaurants.filter((r) => {
        const locations = r.location.split(',').map((loc: string) => loc.trim().toLowerCase());
        return locations.some((loc: string) => loc === selectedLocation.toLowerCase());
      });
      const options = getOptionsFromRestaurants(filtered);

      return options.cuisineTypes.filter(cuisineType => {
        if (CUISINE_HIERARCHY[cuisineType]) {
          const subcuisines = CUISINE_HIERARCHY[cuisineType];
          return filtered.some(r => {
            const types = r.cuisine_type.split(',').map((t: string) => t.trim().toLowerCase());
            return types.some((t: string) => {
              if (t === cuisineType.toLowerCase()) return true;
              return subcuisines.some(sub => t.includes(sub));
            });
          });
        }
        return filtered.some(r => {
          const types = r.cuisine_type.split(',').map((t: string) => t.trim().toLowerCase());
          return types.some((t: string) => t === cuisineType.toLowerCase());
        });
      });
    }
    return allCuisineTypes;
  }, [selectedLocation, restaurants, allCuisineTypes, getOptionsFromRestaurants]);

  useEffect(() => {
    let filtered = restaurants;

    if (selectedLocation) {
      filtered = filtered.filter((r) => {
        const locations = r.location.split(',').map(loc => normalizeLocationName(loc.trim()));
        return locations.some(loc => loc.toLowerCase() === selectedLocation.toLowerCase());
      });
    }

    if (selectedCuisineType) {
      filtered = filtered.filter((r) => {
        const cuisineTypes = r.cuisine_type.split(',').map((type: string) => type.trim());
        return cuisineTypes.some((type: string) => cuisineMatchesFilter(type, selectedCuisineType));
      });
    }

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
      <main className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Hero Section Skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block mb-4 sm:mb-6">
              <Logo />
            </div>
            <div className="h-6 sm:h-10 md:h-12 bg-surface-2 rounded-lg max-w-2xl mx-auto mb-3 sm:mb-4 animate-pulse" />
            <div className="h-4 sm:h-6 bg-surface-2 rounded-lg max-w-md mx-auto animate-pulse" />
          </div>

          {/* Restaurant Section Skeleton */}
          <div className="mb-6 md:mb-8">
            <div className="h-8 bg-surface-2 rounded-lg max-w-md mb-2 animate-pulse" />
            <div className="h-5 bg-surface-2 rounded-lg max-w-lg animate-pulse" />
          </div>

          {/* Filters Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-12 bg-surface-2 rounded-md animate-pulse" />
            <div className="h-12 bg-surface-2 rounded-md animate-pulse" />
          </div>

          {/* Restaurant Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center p-3 bg-surface border border-hairline rounded-2xl animate-pulse">
                <div className="w-[72px] h-[72px] bg-surface-2 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-surface-2 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-surface-2 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4 sm:mb-6">
            <Logo />
          </div>
          <h1 className="font-serif text-xl sm:text-3xl md:text-4xl font-semibold text-ink mb-3 sm:mb-4 px-2">
            Objevuj nejlepší gastro místa v Praze
          </h1>
          <p className="text-sm sm:text-lg text-text-muted max-w-2xl mx-auto px-2">
            Osobní doporučení od{" "}
            <a
              href="https://www.instagram.com/pecu_si_zivot/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta hover:text-terracotta-dark transition-colors font-semibold"
            >
              @Peču si život
            </a>
          </p>
        </div>

        {/* Recent Visits Carousel */}
        <RecentVisits visits={visits} />

        {/* Restaurants Section Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="flex items-center gap-2 font-serif text-2xl md:text-3xl font-semibold text-ink tracking-wide mb-1 md:mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-terracotta flex-shrink-0">
              <line x1="6" y1="3" x2="6" y2="8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              <line x1="8" y1="3" x2="8" y2="8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              <line x1="10" y1="3" x2="10" y2="8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              <line x1="8" y1="8" x2="8" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              <path d="M16 3 L18 8 L14 8 Z" fill="currentColor" />
              <line x1="16" y1="8" x2="16" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
            Nejlepší restaurace v Praze
          </h2>
          <p className="text-sm md:text-base text-text-muted">Filtruj podle lokality, typu kuchyně nebo najdi restauraci ve svém okolí</p>
        </div>

        {/* AI Restaurant Search */}
        <AIRestaurantSearch />

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
          <p className="text-text-muted text-sm">
            Nalezeno <span className="font-semibold text-terracotta">{filteredRestaurants.length}</span> restaurací
          </p>

          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-text-muted">
              Seřadit:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-4 pr-12 py-2 border border-hairline rounded-md text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A6A56' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}
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
            <p className="text-xl text-text-muted mb-8">Nebyly nalezeny žádné restaurace</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-terracotta text-white rounded-md hover:bg-terracotta-dark transition-all duration-300 border border-terracotta shadow-lg shadow-terracotta/30"
            >
              Resetovat filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-16">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Nearby Button */}
      <FloatingNearbyButton />
    </main>
  );
}
