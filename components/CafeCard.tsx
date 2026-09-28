"use client";

import { Cafe } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { useState } from "react";

interface CafeCardProps {
  cafe: Cafe;
  forceLocation?: string; // If provided, only show this location instead of all
}

const TAG_COLORS: Record<string, string> = {
  dezert: "bg-terracotta/10 text-terracotta",
  matcha: "bg-emerald-800/10 text-emerald-800",
  snídaně: "bg-sky-800/10 text-sky-800",
  "top-kava": "bg-amber-800/10 text-amber-800",
};

const TAG_LABELS: Record<string, string> = {
  "top-kava": "TOP káva",
};

export default function CafeCard({ cafe, forceLocation }: CafeCardProps) {
  const proxiedImageUrl = getProxiedImageUrl(cafe.image_url, cafe.name, "cafes");
  const [imageError, setImageError] = useState(false);
  const location = forceLocation || cafe.location;

  const CardContent = () => (
    <>
      <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 overflow-hidden bg-surface-2">
        {proxiedImageUrl && !imageError ? (
          <img
            src={proxiedImageUrl}
            alt={cafe.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl opacity-40">☕</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-serif text-base font-semibold text-ink mb-0.5 truncate">
          {cafe.name}
        </div>
        <div className="text-sm text-text-muted mb-1.5 truncate">{location}</div>
        {cafe.tags && cafe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cafe.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${TAG_COLORS[tag] || "bg-surface-2 text-ink-mid"}`}
              >
                {TAG_LABELS[tag] || tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const rowClasses =
    "flex gap-4 items-center p-3 bg-surface border border-hairline rounded-2xl hover:border-terracotta/40 transition-colors";

  if (cafe.website_url) {
    return (
      <a href={cafe.website_url} target="_blank" rel="noopener noreferrer" className={rowClasses}>
        <CardContent />
      </a>
    );
  }

  return (
    <div className={rowClasses}>
      <CardContent />
    </div>
  );
}
