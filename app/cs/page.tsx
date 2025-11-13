"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantFilter from "@/components/RestaurantFilter";
import QuickFilters from "@/components/QuickFilters";
import TrendingCard from "@/components/TrendingCard";
import Logo from "@/components/Logo";
import { Restaurant, Trending, cuisineMatchesFilter, CUISINE_HIERARCHY } from "@/lib/types";
import { mapLocationToGroup } from "@/lib/location-groups";

export default function Home() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
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
        const [restaurantsRes, trendingsRes, filtersRes] = await Promise.all([
          fetch("/api/restaurants"),
          fetch("/api/trendings"),
          fetch("/api/restaurants/filters"),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const trendingsData = await trendingsRes.json();
        const filtersData = await filtersRes.json();

        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
          setFilteredRestaurants(restaurantsData);
        } else {
          setRestaurants([]);
          setFilteredRestaurants([]);
        }

        if (Array.isArray(trendingsData)) {
          setTrendings(trendingsData);
        } else {
          setTrendings([]);
        }

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

  const getOptionsFromRestaurants = useCallback((restaurantList: Restaurant[]) => {
    const locationSet = new Set<string>();
    const cuisineSet = new Set<string>();

    restaurantList.forEach((r) => {
      r.location.split(',').forEach((loc: string) => {
        const grouped = mapLocationToGroup(loc);
        if (grouped) locationSet.add(grouped);
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
      if (hasMatchingRestaurant) cuisineSet.add(category);
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
    return allLocations;
  }, [selectedCuisineType, restaurants, allLocations, getOptionsFromRestaurants]);

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
        const groups = r.location
          .split(',')
          .map(loc => mapLocationToGroup(loc).toLowerCase());
        return groups.some(g => g === selectedLocation.toLowerCase());
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

  const handleTrendingScroll = () => {
    if (!trendingScrollRef.current) return;
    const scrollLeft = trendingScrollRef.current.scrollLeft;
    const cardWidth = trendingScrollRef.current.offsetWidth * 0.85 + 16;
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
          <p className="text-lg text-gray-400 text-center">
            {t("loadingDescription")} {" "}
            <a href="https://www.instagram.com/pecu_si_zivot/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">@Peču si život</a>
          </p>
          <p className="text-lg text-gray-400 mt-2 text-center">{t("loading")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <p className="text-sm md:text-lg text-gray-300 mt-2 md:mt-6 hidden sm:block">
            {t("subtitle")} {" "}
            <a href="https://www.instagram.com/pecu_si_zivot/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">@Peču si život</a>
          </p>
        </div>

        {trendings.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-wide mb-1 md:mb-2">{t("trendingTitle")}</h2>
              <p className="text-sm md:text-base text-gray-400">{t("trendingSubtitle")}</p>
            </div>
            <div className="md:hidden relative">
              <div ref={trendingScrollRef} onScroll={handleTrendingScroll} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {trendings.map((trending, index) => (
                  <div key={trending.id} className="flex-shrink-0 w-[85%] snap-start">
                    <TrendingCard trending={trending} rank={index + 1} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 mt-2">
                {trendings.map((_, index) => (
                  <div key={index} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${index === trendingScrollIndex ? 'bg-purple-400' : 'bg-purple-500/30'}`} />
                ))}
              </div>
            </div>
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              {trendings.map((trending, index) => (
                <TrendingCard key={trending.id} trending={trending} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        <RestaurantFilter
          locations={availableLocations}
          cuisineTypes={availableCuisineTypes}
          selectedLocation={selectedLocation}
          selectedCuisineType={selectedCuisineType}
          onLocationChange={setSelectedLocation}
          onCuisineTypeChange={setSelectedCuisineType}
          onReset={handleReset}
        />

        <QuickFilters selectedCuisineType={selectedCuisineType} onCuisineTypeChange={setSelectedCuisineType} restaurants={restaurants} />

        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-400 text-sm">
            {tCommon("found")} <span className="font-semibold text-purple-400">{filteredRestaurants.length}</span> {t("foundRestaurants")}
          </p>

          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-gray-400">{t("sortBy")}</label>
            <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="pl-4 pr-12 py-2 border border-purple-600 rounded-md text-sm bg-black text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-no-repeat bg-right" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}>
              <option value="rating">{t("sortByRating")}</option>
              <option value="price">{t("sortByPrice")}</option>
              <option value="name">{t("sortByName")}</option>
            </select>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-8">{t("noRestaurantsFound")}</p>
            <button onClick={handleReset} className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50">
              {tCommon("resetFilters")}
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
