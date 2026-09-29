"use client";

import { useEffect, useMemo, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import { Restaurant } from "@/lib/types";
import { getApiUrl, IS_MOBILE } from "@/lib/api-config";
import { Locale, LocaleProvider } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface LocalitiesPageClientProps {
  locale?: Locale;
  initialRestaurants: Restaurant[];
  initialLocations: string[];
}

export default function LocalitiesPageClient({ locale = "cs", initialRestaurants, initialLocations }: LocalitiesPageClientProps) {
  const t = getDictionary(locale).lokality;
  const tCommon = getDictionary(locale).common;
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [allLocations, setAllLocations] = useState<string[]>(initialLocations);
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
        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
        }
      } catch (error) {
        console.error("[LocalitiesPageClient] Error refreshing data:", error);
      }
    }

    refreshData();
  }, []);

  // Group restaurants by location
  const restaurantsByLocation = useMemo(() => {
    const grouped: Record<string, Restaurant[]> = {};

    restaurants.forEach((restaurant) => {
      const locations = restaurant.location.split(',').map(loc => loc.trim());

      locations.forEach((loc) => {
        if (!grouped[loc]) {
          grouped[loc] = [];
        }
        grouped[loc].push(restaurant);
      });
    });

    // Sort restaurants within each location alphabetically by name
    Object.keys(grouped).forEach((loc) => {
      grouped[loc].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
    });

    return grouped;
  }, [restaurants]);

  // Get sorted locations with restaurant counts (alphabetically)
  const sortedLocations = useMemo(() => {
    return allLocations
      .map((loc) => ({
        name: loc,
        count: restaurantsByLocation[loc]?.length || 0,
      }))
      .filter((loc) => loc.count >= 3)
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [allLocations, restaurantsByLocation]);

  const handleScroll = (locationName: string, event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollLeft = target.scrollLeft;
    const cardWidth = target.offsetWidth * 0.85 + 24; // 85% width + gap (6 * 4px = 24px)
    const index = Math.round(scrollLeft / cardWidth);
    setScrollIndices(prev => ({ ...prev, [locationName]: index }));
  };

  return (
    <LocaleProvider locale={locale}>
    <main className="min-h-screen px-8 pb-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-hairline pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-ink mt-4 md:mt-6 mb-2">{t.title}</h1>
          <p className="text-sm md:text-lg text-text-muted mt-2">
            {t.subtitle}
          </p>
        </div>

        {/* All Locations with Carousels */}
        <div className="space-y-8 md:space-y-12">
          {sortedLocations.map((location) => (
            <div key={location.name}>
              {/* Location Header */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-ink mb-2 flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <span>{location.name}</span>
                </h2>
                <p className="text-text-muted">
                  {tCommon.restaurantCount(location.count)}
                </p>
              </div>

              {/* Horizontal Scrolling Cards */}
              <div className="relative sm:mx-0">
                <div
                  onScroll={(e) => handleScroll(location.name, e)}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide sm:scrollbar-thin snap-x snap-mandatory"
                >
                  {restaurantsByLocation[location.name]?.map((restaurant) => (
                    <div key={restaurant.id} className="flex-shrink-0 w-[85%] sm:w-80 snap-start snap-always">
                      <RestaurantCard restaurant={restaurant} />
                    </div>
                  ))}
                </div>
                {/* Progress indicator - mobile only */}
                <div className="sm:hidden flex justify-center gap-1.5 mt-2">
                  {restaurantsByLocation[location.name]?.slice(0, Math.min(10, restaurantsByLocation[location.name].length)).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        index === (scrollIndices[location.name] || 0) ? 'bg-terracotta' : 'bg-hairline'
                      }`}
                    />
                  ))}
                  {restaurantsByLocation[location.name]?.length > 10 && (
                    <span className="text-xs text-terracotta ml-1">+{restaurantsByLocation[location.name].length - 10}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedLocations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-text-muted">
              {t.emptyTitle}
            </p>
          </div>
        )}
      </div>
    </main>
    </LocaleProvider>
  );
}
