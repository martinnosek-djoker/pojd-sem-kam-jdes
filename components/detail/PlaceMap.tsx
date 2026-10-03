"use client";

import { useState } from "react";
import type { PlacePoint } from "@/lib/place-geo";

interface PlaceMapProps {
  points: PlacePoint[];
  navigateLabel: string;
  largerMapLabel: string;
  mapWord: string;
}

// OpenStreetMap's own embed: free, no API key, attribution included.
export default function PlaceMap({ points, navigateLabel, largerMapLabel, mapWord }: PlaceMapProps) {
  const [index, setIndex] = useState(0);
  const point = points[index];
  const hasCoords = point.lat != null && point.lng != null;

  return (
    <div>
      {points.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {points.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setIndex(i)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                i === index
                  ? "bg-terracotta text-white border-terracotta-dark"
                  : "bg-surface text-ink-mid border-hairline hover:border-terracotta/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {point.address && <p className="text-sm text-ink mb-3">📍 {point.address}</p>}

      {hasCoords && (
        <>
          <iframe
            key={`${point.lat},${point.lng}`}
            title={`${mapWord}: ${point.label}`}
            loading="lazy"
            className="w-full h-64 rounded-xl border border-hairline"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${point.lng! - 0.004}%2C${point.lat! - 0.0025}%2C${point.lng! + 0.004}%2C${point.lat! + 0.0025}&layer=mapnik&marker=${point.lat}%2C${point.lng}`}
          />
          <div className="flex flex-wrap gap-4 mt-3 text-sm font-semibold">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta hover:text-terracotta-dark transition-colors"
            >
              {navigateLabel}
            </a>
            <a
              href={`https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=17/${point.lat}/${point.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-mid hover:text-terracotta transition-colors"
            >
              {largerMapLabel}
            </a>
          </div>
        </>
      )}
    </div>
  );
}
