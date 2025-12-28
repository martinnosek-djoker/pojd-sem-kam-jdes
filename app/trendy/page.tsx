"use client";

import { useEffect, useState } from "react";
import TrendingCard from "@/components/TrendingCard";
import Logo from "@/components/Logo";
import { Trending } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function TrendyPage() {
  const [trendings, setTrendings] = useState<Trending[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trendings
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(getApiUrl("/api/trendings"));
        const data = await res.json();

        // Validate that data is an array
        if (Array.isArray(data)) {
          setTrendings(data);
        } else {
          console.error("Trendings data is not an array:", data);
          setTrendings([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setTrendings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-12">
            <Logo />
          </div>
          {/* Loading skeleton */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-8 pb-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6 mb-2">
            🔥 TOP 10 trendů
          </h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            Nejžhavější tipy v pražské gastronomii od{" "}
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

        {/* Trending list */}
        {trendings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">Momentálně nejsou k dispozici žádné trendy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendings.map((trending, index) => (
              <TrendingCard key={trending.id} trending={trending} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
