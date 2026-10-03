"use client";

import { useEffect, useState } from "react";
import CafeCard from "@/components/CafeCard";
import Logo from "@/components/Logo";
import { Cafe } from "@/lib/types";
import { getApiUrl, IS_MOBILE } from "@/lib/api-config";
import { Locale, LocaleProvider } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface CafesPageClientProps {
  locale?: Locale;
  initialCafes: Cafe[];
  initialLocations: string[];
}

export default function CafesPageClient({ locale = "cs", initialCafes, initialLocations }: CafesPageClientProps) {
  const t = getDictionary(locale).kavarny;
  const tCommon = getDictionary(locale).common;
  const [cafes, setCafes] = useState<Cafe[]>(initialCafes);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>(initialCafes);
  const [allLocations, setAllLocations] = useState<string[]>(initialLocations);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating">("name");

  // In the native app, refresh with a live fetch after the initial (build-time) data paints,
  // since a static mobile build can otherwise go stale between app releases.
  useEffect(() => {
    if (!IS_MOBILE) return;

    async function refreshData() {
      try {
        const [cafesRes, filtersRes] = await Promise.all([
          fetch(getApiUrl("/api/cafes")),
          fetch(getApiUrl("/api/cafes/filters")),
        ]);

        const cafesData = await cafesRes.json();
        const filtersData = await filtersRes.json();

        if (Array.isArray(cafesData)) {
          setCafes(cafesData);
        }
        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
        }
      } catch (error) {
        console.error("[CafesPageClient] Error refreshing data:", error);
      }
    }

    refreshData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = cafes;

    if (selectedLocation) {
      filtered = filtered.filter((c) => {
        const locations = c.location
          .split(',')
          .map(loc => loc.trim().toLowerCase());
        return locations.some(loc => loc === selectedLocation.toLowerCase());
      });
    }

    if (selectedTag) {
      filtered = filtered.filter((c) => {
        return c.tags && c.tags.includes(selectedTag);
      });
    }

    // Default A-Z; by rating, best first with unrated cafes last (then A-Z)
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "rating") {
        const diff = (b.rating ?? -1) - (a.rating ?? -1);
        if (diff !== 0) return diff;
      }
      return a.name.localeCompare(b.name, 'cs');
    });

    setFilteredCafes(filtered);
  }, [selectedLocation, selectedTag, cafes, sortBy]);

  const handleReset = () => {
    setSelectedLocation("");
    setSelectedTag("");
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
            {t.subtitlePrefix}{" "}
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

        {/* Filters Container */}
        <div className="mb-6 sm:mb-8 bg-surface border border-hairline rounded-2xl p-4 sm:p-6 shadow-lg shadow-black/5 space-y-4">
          {/* Location Filter */}
          {allLocations.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-ink-mid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 sm:py-3.5 border border-hairline rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta bg-surface text-ink focus:outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right font-medium"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A6A56' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value="">{t.allLocations}</option>
                  {allLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedLocation || selectedTag) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-3 sm:py-3.5 bg-terracotta text-white rounded-xl hover:bg-terracotta-dark active:scale-95 transition-all duration-200 font-medium shadow-lg shadow-black/10 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{t.reset}</span>
                </button>
              )}
            </div>
          )}

          {/* Tag Filter Buttons */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink-mid">{t.categoryLabel}</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: t.tagAll, color: 'bg-surface-2 text-ink-mid border-hairline hover:bg-surface-tint', activeColor: 'bg-terracotta text-white border-terracotta-dark shadow-lg shadow-black/10' },
                { value: 'dezert', label: t.tagDezert, color: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100', activeColor: 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/50' },
                { value: 'matcha', label: t.tagMatcha, color: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100', activeColor: 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/50' },
                { value: 'snídaně', label: t.tagSnidane, color: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100', activeColor: 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-900/50' },
                { value: 'top-kava', label: t.tagTopKava, color: 'bg-terracotta/10 text-terracotta border-terracotta/20 hover:bg-terracotta/20', activeColor: 'bg-terracotta text-white border-terracotta-dark shadow-lg shadow-terracotta/40' },
              ].map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setSelectedTag(tag.value)}
                  className={`px-4 py-2 rounded-xl border transition-all duration-200 font-medium ${
                    selectedTag === tag.value ? tag.activeColor : tag.color
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-text-muted text-sm">
            {t.count(filteredCafes.length)}
          </p>

          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-text-muted">
              {t.sortLabel}
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "rating")}
              className="pl-4 pr-12 py-2 border border-hairline rounded-md text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A6A56' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="name">{t.sortName}</option>
              <option value="rating">{t.sortRating}</option>
            </select>
          </div>
        </div>

        {/* Cafe grid */}
        {filteredCafes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-text-muted mb-8">{t.emptyTitle}</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-terracotta text-white rounded-md hover:bg-terracotta-dark transition-all duration-300 border border-terracotta-dark shadow-lg shadow-black/5"
            >
              {tCommon.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCafes.map((cafe) => (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
              />
            ))}
          </div>
        )}
      </div>
    </main>
    </LocaleProvider>
  );
}
