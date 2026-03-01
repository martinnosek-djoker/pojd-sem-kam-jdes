"use client";

import { useEffect, useState, useMemo } from "react";
import CafeCard from "@/components/CafeCard";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import { Cafe, Review } from "@/lib/types";
import { getApiUrl, IS_MOBILE } from "@/lib/api-config";

export default function CafesPage() {


  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewsByCafeId, setReviewsByCafeId] = useState<Map<number, Review>>(new Map());

  // Fetch cafes, reviews, and filters
  useEffect(() => {
    async function fetchData() {
      try {
        // For mobile builds, load reviews from cache
        let reviewsData: Review[] = [];
        if (IS_MOBILE) {
          try {
            const reviewsCacheRes = await fetch('/.reviews-cache.json');
            if (reviewsCacheRes.ok) {
              reviewsData = await reviewsCacheRes.json();
            }
          } catch (err) {
            console.error("Could not load reviews cache:", err);
          }
        }

        const fetchPromises = IS_MOBILE
          ? [
              fetch(getApiUrl("/api/cafes")),
              fetch(getApiUrl("/api/cafes/filters")),
            ]
          : [
              fetch(getApiUrl("/api/cafes")),
              fetch(getApiUrl("/api/cafes/filters")),
              fetch(getApiUrl("/api/reviews")),
            ];

        const responses = await Promise.all(fetchPromises);
        const [cafesData, filtersData, ...rest] = await Promise.all(
          responses.map(r => r.json())
        );

        // Get reviews data (from cache for mobile, from API for web)
        if (!IS_MOBILE && rest.length > 0) {
          reviewsData = rest[0];
        }

        // Validate that cafesData is an array
        if (Array.isArray(cafesData)) {
          setCafes(cafesData);
          setFilteredCafes(cafesData);
        } else {
          console.error("Cafes data is not an array:", cafesData);
          setCafes([]);
          setFilteredCafes([]);
        }

        // Validate filters data
        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
        }

        // Create map of cafe_id to review
        if (Array.isArray(reviewsData)) {
          const reviewsMap = new Map<number, Review>();
          reviewsData.forEach((review: Review) => {
            if (review.cafe_id) {
              reviewsMap.set(review.cafe_id, review);
            }
          });
          setReviewsByCafeId(reviewsMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setCafes([]);
        setFilteredCafes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate available filter options based on current selection
  const availableLocations = useMemo(() => {
    return allLocations;
  }, [allLocations]);

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

    // Sort by name
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'cs'));

    setFilteredCafes(filtered);
  }, [selectedLocation, selectedTag, cafes]);

  const handleReset = () => {
    setSelectedLocation("");
    setSelectedTag("");
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
    <main className="min-h-screen px-8 pb-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">Kavárny</h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            Nejlepší kavárny v Praze od{" "}
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

        {/* Filters Container */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-purple-600/20 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
          {/* Location Filter */}
          {availableLocations.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 sm:py-3.5 border border-purple-600/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-black/50 text-purple-200 focus:outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right font-medium"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value="">Všechny lokality</option>
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedLocation || selectedTag) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-3 sm:py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-95 transition-all duration-200 font-medium shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Zrušit</span>
                </button>
              )}
            </div>
          )}

          {/* Tag Filter Buttons */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-purple-300">Kategorie:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'Všechny', color: 'bg-purple-600/30 text-purple-200 border-purple-500/30 hover:bg-purple-600/50' },
                { value: 'dezert', label: 'Dezert', color: 'bg-orange-600/30 text-orange-200 border-orange-500/30 hover:bg-orange-600/50' },
                { value: 'matcha', label: 'Matcha', color: 'bg-green-600/30 text-green-200 border-green-500/30 hover:bg-green-600/50' },
                { value: 'snídaně', label: 'Snídaně', color: 'bg-sky-600/30 text-sky-200 border-sky-500/30 hover:bg-sky-600/50' },
              ].map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setSelectedTag(tag.value)}
                  className={`px-4 py-2 rounded-xl border transition-all duration-200 font-medium ${
                    selectedTag === tag.value
                      ? tag.value === ''
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50'
                        : tag.value === 'dezert'
                        ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/50'
                        : tag.value === 'matcha'
                        ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/50'
                        : 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-900/50'
                      : tag.color
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
          <p className="text-gray-400 text-sm">
            Nalezeno <span className="font-semibold text-purple-400">{filteredCafes.length}</span> {filteredCafes.length === 1 ? "kavárnu" : filteredCafes.length < 5 ? "kavárny" : "kaváren"}
          </p>
        </div>

        {/* Cafe grid */}
        {filteredCafes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-8">Nebyly nalezeny žádné kavárny</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50"
            >
              Resetovat filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCafes.map((cafe) => (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
                review={reviewsByCafeId.get(cafe.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
