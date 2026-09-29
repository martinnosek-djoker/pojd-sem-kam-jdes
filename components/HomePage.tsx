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
import { getApiUrl, IS_MOBILE } from "@/lib/api-config";
import { Locale, LocaleProvider } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface HomePageProps {
  locale?: Locale;
  initialRestaurants: Restaurant[];
  initialLocations: string[];
  initialCuisineTypes: string[];
  initialVisits: Visit[];
}

export default function HomePage({ locale = "cs", initialRestaurants, initialLocations, initialCuisineTypes, initialVisits }: HomePageProps) {
  const t = getDictionary(locale).home;
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [allLocations, setAllLocations] = useState<string[]>(initialLocations);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>(initialCuisineTypes);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCuisineType, setSelectedCuisineType] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("name");

  // In the native app, refresh with a live fetch after the initial (build-time) data paints,
  // since a static mobile build can otherwise go stale between app releases.
  useEffect(() => {
    if (!IS_MOBILE) return;

    async function refreshData() {
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
        console.error("[HomePage] Error refreshing data:", error);
      }
    }

    refreshData();
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

  return (
    <LocaleProvider locale={locale}>
      <main className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block mb-4 sm:mb-6">
              <Logo />
            </div>
            <h1 className="font-serif text-xl sm:text-3xl md:text-4xl font-semibold text-ink mb-3 sm:mb-4 px-2">
              {t.heroTitle}
            </h1>
            <p className="text-sm sm:text-lg text-text-muted max-w-2xl mx-auto px-2">
              {t.heroSubtitlePrefix}{" "}
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
              {t.sectionTitle}
            </h2>
            <p className="text-sm md:text-base text-text-muted">{t.sectionSubtitle}</p>
          </div>

          {/* AI Restaurant Search - Czech only for now, the AI backend doesn't speak English yet */}
          {locale === "cs" && <AIRestaurantSearch />}

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
              {t.count(filteredRestaurants.length)}
            </p>

            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm text-text-muted">
                {t.sortLabel}
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-4 pr-12 py-2 border border-hairline rounded-md text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A6A56' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}
              >
                <option value="rating">{t.sortRating}</option>
                <option value="price">{t.sortPrice}</option>
                <option value="name">{t.sortName}</option>
              </select>
            </div>
          </div>

          {/* Restaurant grid */}
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-text-muted mb-8">{t.emptyTitle}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-terracotta text-white rounded-md hover:bg-terracotta-dark transition-all duration-300 border border-terracotta shadow-lg shadow-terracotta/30"
              >
                {t.resetFilters}
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
    </LocaleProvider>
  );
}
