"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import BakeryCard from "@/components/BakeryCard";
import Logo from "@/components/Logo";
import { Bakery } from "@/lib/types";
import { mapLocationToGroup } from "@/lib/location-groups";

export default function BakeriesPage() {
  const t = useTranslations("bakeries");
  const tCommon = useTranslations("common");
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
          fetch("/api/bakeries"),
          fetch("/api/bakeries/filters"),
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
        const groups = b.location
          .split(',')
          .map(loc => mapLocationToGroup(loc).toLowerCase());
        return groups.some(g => g === selectedLocation.toLowerCase());
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
          <p className="text-lg text-gray-400 text-center">{t("loading")}</p>
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
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">{t("title")}</h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            {t("subtitle")}{" "}
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
          <div className="mb-8 p-6 bg-gray-900/50 border border-purple-500/30 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
              <div className="flex-1 w-full">
                <label htmlFor="location" className="block text-sm text-gray-400 mb-2">
                  {t("locationFilterLabel")}
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-600 rounded-md bg-black text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value="">{t("locationFilterAll")}</option>
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50 whitespace-nowrap"
                >
                  {tCommon("reset")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-400 text-sm">
            {t("found")} <span className="font-semibold text-purple-400">{filteredBakeries.length}</span> {t("foundBakeries")}
          </p>
        </div>

        {/* Bakery grid */}
        {filteredBakeries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-8">{t("noBakeriesFound")}</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50"
            >
              {tCommon("resetFilters")}
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
