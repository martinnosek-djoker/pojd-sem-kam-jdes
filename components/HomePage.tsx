"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import HappeningNow from "@/components/HappeningNow";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantFilter from "@/components/RestaurantFilter";
import QuickFilters from "@/components/QuickFilters";
import TrendingCard from "@/components/TrendingCard";
import MichelinCard from "@/components/MichelinCard";
import FloatingNearbyButton from "@/components/FloatingNearbyButton";
import LoadingPot from "@/components/LoadingPot";
import { Restaurant, Trending, MichelinRestaurant, cuisineMatchesFilter, CUISINE_HIERARCHY } from "@/lib/types";
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
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-500/30 rounded-full flex items-center justify-center group-hover:bg-orange-500/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  </div>
);

const StarIcon = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-500/30 rounded-full flex items-center justify-center group-hover:bg-yellow-500/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  </div>
);

const RestaurantIcon = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-500/30 rounded-full flex items-center justify-center group-hover:bg-purple-500/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  </div>
);

const CoffeeIcon = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-600/30 rounded-full flex items-center justify-center group-hover:bg-amber-600/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h12v12a4 4 0 01-4 4H8a4 4 0 01-4-4V4zm12 4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
    </svg>
  </div>
);

const CakeIcon = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-pink-500/30 rounded-full flex items-center justify-center group-hover:bg-pink-500/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-pink-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-500/30 rounded-full flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  </div>
);

const CompassIcon = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/30 rounded-full flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-300" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
    </svg>
  </div>
);

const CalendarIcon = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-violet-500/30 rounded-full flex items-center justify-center group-hover:bg-violet-500/40 transition-colors">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-violet-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
    </svg>
  </div>
);

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [trendings, setTrendings] = useState<Trending[]>([]);
  const [michelinRestaurants, setMichelinRestaurants] = useState<MichelinRestaurant[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [allCuisineTypes, setAllCuisineTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCuisineType, setSelectedCuisineType] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("name");
  const [trendingScrollIndex, setTrendingScrollIndex] = useState(0);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const [michelinScrollIndex, setMichelinScrollIndex] = useState(0);
  const michelinScrollRef = useRef<HTMLDivElement>(null);

  const sections: SectionCard[] = [
    {
      href: "/kuchyne",
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
      description: "Specialitní káva a útulná atmosféra",
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
      description: "Najdi podniky ve své čtvrti",
      icon: <MapPinIcon />,
      gradient: "from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-400",
    },
    {
      href: "/pobliz",
      title: "V okolí",
      description: "Restaurace a kavárny poblíž",
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

  // Fetch restaurants, trendings, and filters
  useEffect(() => {
    async function fetchData() {
      try {
        const restaurantsUrl = getApiUrl("/api/restaurants");
        const trendingsUrl = getApiUrl("/api/trendings");
        const michelinUrl = getApiUrl("/api/michelin");
        const filtersUrl = getApiUrl("/api/restaurants/filters");

        const [restaurantsRes, trendingsRes, michelinRes, filtersRes] = await Promise.all([
          fetch(restaurantsUrl),
          fetch(trendingsUrl),
          fetch(michelinUrl),
          fetch(filtersUrl),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const trendingsData = await trendingsRes.json();
        const michelinData = await michelinRes.json();
        const filtersData = await filtersRes.json();

        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
          setFilteredRestaurants(restaurantsData);
        }
        if (Array.isArray(trendingsData)) {
          setTrendings(trendingsData);
        }
        if (Array.isArray(michelinData)) {
          setMichelinRestaurants(michelinData);
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

  const handleTrendingScroll = () => {
    if (!trendingScrollRef.current) return;
    const scrollLeft = trendingScrollRef.current.scrollLeft;
    const cardWidth = trendingScrollRef.current.offsetWidth * 0.85 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setTrendingScrollIndex(index);
  };

  const handleMichelinScroll = () => {
    if (!michelinScrollRef.current) return;
    const scrollLeft = michelinScrollRef.current.scrollLeft;
    const cardWidth = michelinScrollRef.current.offsetWidth * 0.85 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setMichelinScrollIndex(index);
  };

  if (loading) {
    return (
      <main className="min-h-screen px-8 pb-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="pt-10 md:pt-8 mb-8">
            <Logo />
          </div>
          <LoadingPot />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 px-4">
            Objevuj nejlepší gastro místa v Praze
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
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

        {/* Happening Now - Featured Events */}
        <div className="mb-12 sm:mb-16">
          <HappeningNow />
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`
                group relative overflow-hidden
                bg-gradient-to-br ${section.gradient}
                border-2 rounded-2xl
                p-6 sm:p-8
                transition-all duration-300
                hover:scale-105 hover:shadow-2xl hover:shadow-purple-900/30
                active:scale-95
                flex flex-col items-center justify-center
                min-h-[180px] sm:min-h-[200px]
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
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {section.icon}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
                {section.title}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 text-center leading-snug">
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

              {/* Decorative corners */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/10 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-white/10 rounded-bl-2xl pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* Trendings Section */}
        {trendings.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-wide mb-1 md:mb-2">🔥 TOP 10 trendů</h2>
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

        {/* Michelin Section */}
        {michelinRestaurants.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-wide mb-1 md:mb-2">⭐ Michelin 2026</h2>
              <p className="text-sm md:text-base text-gray-400">Michelinské hvězdy a ocenění Bib Gourmand v Praze</p>
            </div>
            {/* Mobile: Horizontal Carousel */}
            <div className="md:hidden relative">
              <div
                ref={michelinScrollRef}
                onScroll={handleMichelinScroll}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              >
                {michelinRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="flex-shrink-0 w-[85%] snap-start snap-always">
                    <MichelinCard restaurant={restaurant} />
                  </div>
                ))}
              </div>
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-2">
                {michelinRestaurants.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      index === michelinScrollIndex ? 'bg-purple-400' : 'bg-purple-500/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {michelinRestaurants.map((restaurant) => (
                <MichelinCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

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

        {/* Explore Pages CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          <a
            href="/lokality"
            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-400/50 rounded-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600/50 rounded-lg flex items-center justify-center group-hover:bg-purple-600/70 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-bold text-purple-300 group-hover:text-purple-200 transition-colors mb-1">
                Ukaž lokality
              </h3>
              <p className="text-xs md:text-sm text-gray-400">
                Prohlédni si všechny pražské čtvrti
              </p>
            </div>
            <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/kuchyne"
            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/30 hover:to-purple-600/30 border border-pink-500/30 hover:border-pink-400/50 rounded-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-pink-600/50 rounded-lg flex items-center justify-center group-hover:bg-pink-600/70 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-bold text-pink-300 group-hover:text-pink-200 transition-colors mb-1">
                Ukaž světové kuchyně
              </h3>
              <p className="text-xs md:text-sm text-gray-400">
                Objevuj různé kulinářské styly
              </p>
            </div>
            <svg className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

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
