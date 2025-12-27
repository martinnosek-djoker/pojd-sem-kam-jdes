"use client";

import { useEffect, useState, useMemo } from "react";
import MichelinCard from "@/components/MichelinCard";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import { MichelinRestaurant, MichelinAwardType, MICHELIN_AWARD_LABELS } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function MichelinPage() {
  const [restaurants, setRestaurants] = useState<MichelinRestaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<MichelinRestaurant[]>([]);
  const [selectedAwardType, setSelectedAwardType] = useState<MichelinAwardType | "">("");
  const [loading, setLoading] = useState(true);

  // Fetch Michelin restaurants
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(getApiUrl("/api/michelin"));
        const data = await res.json();

        // Validate that data is an array
        if (Array.isArray(data)) {
          setRestaurants(data);
          setFilteredRestaurants(data);
        } else {
          console.error("Michelin data is not an array:", data);
          setRestaurants([]);
          setFilteredRestaurants([]);
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

  // Apply filters
  useEffect(() => {
    let filtered = restaurants;

    if (selectedAwardType) {
      filtered = filtered.filter((r) => r.award_type === selectedAwardType);
    }

    // Sort by award type (2-stars > 1-star > bib-gourmand), then by display_order
    filtered = [...filtered].sort((a, b) => {
      const awardOrder = { "2-stars": 0, "1-star": 1, "bib-gourmand": 2 };
      const awardCompare = awardOrder[a.award_type] - awardOrder[b.award_type];
      if (awardCompare !== 0) return awardCompare;
      return a.display_order - b.display_order;
    });

    setFilteredRestaurants(filtered);
  }, [selectedAwardType, restaurants]);

  const handleReset = () => {
    setSelectedAwardType("");
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
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">
            ⭐ Michelin 2026
          </h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            Michelinské restaurace v Praze od{" "}
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

        {/* Award Type Filter */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-purple-600/20 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <select
                id="awardType"
                value={selectedAwardType}
                onChange={(e) => setSelectedAwardType(e.target.value as MichelinAwardType | "")}
                className="w-full pl-11 pr-10 py-3 sm:py-3.5 border border-purple-600/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-black/50 text-purple-200 focus:outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right font-medium"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1.5em 1.5em"
                }}
              >
                <option value="">Všechna ocenění</option>
                <option value="2-stars">{MICHELIN_AWARD_LABELS["2-stars"]}</option>
                <option value="1-star">{MICHELIN_AWARD_LABELS["1-star"]}</option>
                <option value="bib-gourmand">{MICHELIN_AWARD_LABELS["bib-gourmand"]}</option>
              </select>
            </div>

            {selectedAwardType && (
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
        </div>

        {/* Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-400 text-sm">
            Nalezeno <span className="font-semibold text-purple-400">{filteredRestaurants.length}</span> {filteredRestaurants.length === 1 ? "restauraci" : filteredRestaurants.length < 5 ? "restaurace" : "restaurací"}
          </p>
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
              <MichelinCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
