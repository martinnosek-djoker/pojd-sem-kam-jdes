"use client";

import { useEffect, useState, useMemo } from "react";
import BakeryCard from "@/components/BakeryCard";
import Logo from "@/components/Logo";
import { Bakery } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function BakeriesPage() {
  
  
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [filteredBakeries, setFilteredBakeries] = useState<Bakery[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch bakeries and filters
  useEffect(() => {
    async function fetchData() {
      try {
        const [bakeriesRes, filtersRes] = await Promise.all([
          fetch(getApiUrl("/api/bakeries")),
          fetch(getApiUrl("/api/bakeries/filters")),
        ]);

        const bakeriesData = await bakeriesRes.json();
        const filtersData = await filtersRes.json();

        // Validate that bakeriesData is an array
        if (Array.isArray(bakeriesData)) {
          setBakeries(bakeriesData);
          setFilteredBakeries(bakeriesData);
        } else {
          console.error("Bakeries data is not an array:", bakeriesData);
          setBakeries([]);
          setFilteredBakeries([]);
        }

        // Validate filters data
        if (filtersData && Array.isArray(filtersData.locations)) {
          setAllLocations(filtersData.locations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setBakeries([]);
        setFilteredBakeries([]);
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
    let filtered = bakeries;

    if (selectedLocation) {
      filtered = filtered.filter((b) => {
        const locations = b.location
          .split(',')
          .map(loc => loc.trim().toLowerCase());
        return locations.some(loc => loc === selectedLocation.toLowerCase());
      });
    }

    // Sort by name
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'cs'));

    setFilteredBakeries(filtered);
  }, [selectedLocation, bakeries]);

  const handleReset = () => {
    setSelectedLocation("");
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Logo />
          </div>
          <p className="text-lg text-gray-400 text-center">Načítání...</p>
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
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">Cukrárny</h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            Nejlepší cukrárny v Praze od{" "}
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

        {/* Location Filter */}
        {availableLocations.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-purple-600/20 rounded-2xl p-4 sm:p-6 shadow-lg">
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

              {selectedLocation && (
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
        )}

        {/* Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-400 text-sm">
            Nalezeno <span className="font-semibold text-purple-400">{filteredBakeries.length}</span> {filteredBakeries.length === 1 ? "cukrárnu" : filteredBakeries.length < 5 ? "cukrárny" : "cukráren"}
          </p>
        </div>

        {/* Bakery grid */}
        {filteredBakeries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-8">Nebyly nalezeny žádné cukrárny</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50"
            >
              Resetovat filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBakeries.map((bakery) => (
              <BakeryCard key={bakery.id} bakery={bakery} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
