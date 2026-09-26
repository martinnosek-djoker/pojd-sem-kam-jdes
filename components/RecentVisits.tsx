"use client";

import { useEffect, useRef, useState } from "react";
import { Visit } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";
import VisitCard from "./VisitCard";

export default function RecentVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/visits?limit=10"))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVisits(data);
      })
      .catch((error) => {
        console.error("[RecentVisits] Error fetching visits:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const scrollCarousel = (direction: "prev" | "next") => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.querySelector("[data-carousel-card]")?.clientWidth ?? 380;
    const gap = 32; // gap-8 = 2rem = 32px
    carouselRef.current.scrollBy({
      left: direction === "next" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    });
  };

  // Nothing to show yet (still loading, no visits logged, or table not migrated) - stay invisible
  if (loading || visits.length === 0) return null;

  return (
    <div className="mb-12 sm:mb-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-wide mb-1 md:mb-2">
            ✨ Nejnovější recenze
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            Moje poslední návštěvy restaurací a kaváren
          </p>
        </div>
        {visits.length > 1 && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => scrollCarousel("prev")}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-purple-500/50 bg-black/60 text-purple-400 hover:border-purple-400 hover:text-purple-300 hover:bg-purple-900/30 transition-all duration-200"
              aria-label="Předchozí návštěva"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollCarousel("next")}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-purple-500/50 bg-black/60 text-purple-400 hover:border-purple-400 hover:text-purple-300 hover:bg-purple-900/30 transition-all duration-200"
              aria-label="Další návštěva"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        ref={carouselRef}
        className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {visits.map((visit) => (
          <div
            key={visit.id}
            data-carousel-card
            className="flex-none w-[85vw] sm:w-[380px] lg:w-[420px] snap-start"
          >
            <VisitCard visit={visit} />
          </div>
        ))}
      </div>
    </div>
  );
}
