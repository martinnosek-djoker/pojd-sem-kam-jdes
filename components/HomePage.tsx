"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantFilter from "@/components/RestaurantFilter";
import QuickFilters from "@/components/QuickFilters";
import FloatingNearbyButton from "@/components/FloatingNearbyButton";
import { Restaurant, cuisineMatchesFilter, CUISINE_HIERARCHY } from "@/lib/types";
import { normalizeLocationName } from "@/lib/location-utils";
import { getApiUrl } from "@/lib/api-config";

interface SectionCard {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

// SVG Icons with circular backgrounds for better visibility
const FlameIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-orange-500/30 rounded-full flex items-center justify-center group-hover:bg-orange-500/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-orange-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  </div>
);

const StarIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-yellow-500/30 rounded-full flex items-center justify-center group-hover:bg-yellow-500/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  </div>
);

const RestaurantIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-purple-500/30 rounded-full flex items-center justify-center group-hover:bg-purple-500/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
    </svg>
  </div>
);

const CoffeeIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-amber-600/30 rounded-full flex items-center justify-center group-hover:bg-amber-600/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h12v12a4 4 0 01-4 4H8a4 4 0 01-4-4V4zm12 4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
    </svg>
  </div>
);

const CakeIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-pink-500/30 rounded-full flex items-center justify-center group-hover:bg-pink-500/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-pink-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="5" y="13" width="14" height="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="17" width="12" height="3" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13c0-1 1-2 2-2h10c1 0 2 1 2 2" />
      <line x1="9" y1="11" x2="9" y2="7" strokeLinecap="round" />
      <line x1="12" y1="11" x2="12" y2="6" strokeLinecap="round" />
      <line x1="15" y1="11" x2="15" y2="7" strokeLinecap="round" />
    </svg>
  </div>
);

const MapPinIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-blue-500/30 rounded-full flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  </div>
);

const CompassIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-green-500/30 rounded-full flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-green-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  </div>
);

const CalendarIcon = () => (
  <div className="w-14 h-14 sm:w-24 sm:h-24 bg-violet-500/30 rounded-full flex items-center justify-center group-hover:bg-violet-500/40 transition-colors">
    <svg className="w-7 h-7 sm:w-12 sm:h-12 text-violet-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
    </svg>
  </div>
);

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCuisineType, setSelectedCuisineType] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("name");

  const sections: SectionCard[] = [
    {
      href: "/trendy",
      title: "TOP 10 trendů",
      description: "Nejžhavější tipy v pražské gastronomii",
      icon: <FlameIcon />,
      gradient: "from-orange-600/20 to-red-600/20 border-orange-500/30 hover:border-orange-400",
    },
    {
      href: "/michelin",
      title: "Michelin 2026",
      description: "Hvězdičkové restaurace a Bib Gourmand",
      icon: <StarIcon />,
      gradient: "from-yellow-600/20 to-amber-600/20 border-yellow-500/30 hover:border-yellow-400",
      badge: "Nové",
    },
    {
      href: "/kuchyne",
      title: "Restaurace",
      description: "Nejlepší restaurace podle typu kuchyně",
      icon: <RestaurantIcon />,
      gradient: "from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400",
    },
    {
      href: "/kavarny",
      title: "Kavárny",
      description: "Prémiová káva a útulná atmosféra",
      icon: <CoffeeIcon />,
      gradient: "from-amber-700/20 to-yellow-700/20 border-amber-600/30 hover:border-amber-500",
    },
    {
      href: "/cukrarny",
      title: "Cukrárny",
      description: "Nejlepší dorty a zákusky v Praze",
      icon: <CakeIcon />,
      gradient: "from-pink-600/20 to-rose-600/20 border-pink-500/30 hover:border-pink-400",
    },
    {
      href: "/lokality",
      title: "Podle lokality",
      description: "Najdi podniky dle pražské čtvrti",
      icon: <MapPinIcon />,
      gradient: "from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-400",
    },
    {
      href: "/pobliz",
      title: "V okolí",
      description: "Načti svou polohu a najdi nejbližší podniky",
      icon: <CompassIcon />,
      gradient: "from-green-600/20 to-emerald-600/20 border-green-500/30 hover:border-green-400",
    },
    {
      href: "/akce",
      title: "Gastro akce",
      description: "Food festivaly a kulinářské události",
      icon: <CalendarIcon />,
      gradient: "from-violet-600/20 to-purple-600/20 border-violet-500/30 hover:border-violet-400",
    },
  ];

  // Fetch restaurants and filters
  useEffect(() => {
    async function fetchData() {
      try {
        const restaurantsUrl = getApiUrl("/api/restaurants");
        const filtersUrl = getApiUrl("/api/restaurants/filters");

        const [restaurantsRes, filtersRes] = await Promise.all([
          fetch(restaurantsUrl),
          fetch(filtersUrl),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const filtersData = await filtersRes.json();

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
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Hero Section Skeleton */}
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-block mb-4 sm:mb-6">
              <Logo />
            </div>
            <div className="h-6 sm:h-10 md:h-12 bg-gray-800 rounded-lg max-w-2xl mx-auto mb-3 sm:mb-4 animate-pulse" />
            <div className="h-4 sm:h-6 bg-gray-800 rounded-lg max-w-md mx-auto animate-pulse" />
          </div>

          {/* Category Tiles Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-gray-700/30 rounded-xl sm:rounded-2xl p-3 sm:p-8 min-h-[140px] sm:min-h-[200px] flex flex-col items-center justify-center animate-pulse"
              >
                {/* Icon skeleton */}
                <div className="w-14 h-14 sm:w-24 sm:h-24 bg-gray-700/50 rounded-full mb-2 sm:mb-4" />
                {/* Title skeleton */}
                <div className="h-4 sm:h-6 bg-gray-700/50 rounded w-20 sm:w-32 mb-1 sm:mb-2" />
                {/* Description skeleton - hidden on mobile */}
                <div className="h-3 sm:h-4 bg-gray-700/50 rounded w-28 sm:w-40 hidden sm:block" />
              </div>
            ))}
          </div>

          {/* Restaurant Section Skeleton */}
          <div className="mb-6 md:mb-8">
            <div className="h-8 bg-gray-800 rounded-lg max-w-md mb-2 animate-pulse" />
            <div className="h-5 bg-gray-800 rounded-lg max-w-lg animate-pulse" />
          </div>

          {/* Filters Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-12 bg-gray-800 rounded-md animate-pulse" />
            <div className="h-12 bg-gray-800 rounded-md animate-pulse" />
          </div>

          {/* Restaurant Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-700/50 rounded-lg mb-4" />
                <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-4" />
                <div className="h-4 bg-gray-700/50 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-block mb-4 sm:mb-6">
            <Logo />
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            Objevuj nejlepší gastro místa v Praze
          </h1>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto px-2">
            Osobní doporučení od{" "}
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

        {/* Sections Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`
                group relative overflow-hidden
                bg-gradient-to-br ${section.gradient}
                border-2 rounded-xl sm:rounded-2xl
                p-3 sm:p-8
                transition-all duration-300
                hover:scale-105 hover:shadow-2xl hover:shadow-purple-900/30
                active:scale-95
                flex flex-col items-center justify-center
                min-h-[140px] sm:min-h-[200px]
                touch-manipulation
              `}
            >
              {/* Badge */}
              {section.badge && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full border-2 border-purple-400 shadow-lg">
                  {section.badge}
                </div>
              )}

              {/* Icon */}
              <div className="mb-2 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {section.icon}
              </div>

              {/* Title */}
              <h2 className="text-sm sm:text-2xl font-bold text-white mb-1 sm:mb-2 text-center leading-tight">
                {section.title}
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-base text-gray-300 text-center leading-tight sm:leading-snug hidden sm:block">
                {section.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Restaurants Section Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-wide mb-1 md:mb-2">🍽️ Nejlepší restaurace v Praze</h2>
          <p className="text-sm md:text-base text-gray-400">Filtruj podle lokality, typu kuchyně nebo najdi restauraci ve svém okolí</p>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Nearby Button */}
      <FloatingNearbyButton />
    </main>
  );
}
