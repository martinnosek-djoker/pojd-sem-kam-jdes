"use client";

import { Bakery } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { useState } from "react";

interface BakeryCardProps {
  bakery: Bakery;
  forceLocation?: string; // If provided, only show this location instead of all
}

export default function BakeryCard({ bakery, forceLocation }: BakeryCardProps) {
  const proxiedImageUrl = getProxiedImageUrl(bakery.image_url, bakery.name, "bakeries");
  const [imageError, setImageError] = useState(false);
  const location = forceLocation || bakery.location;

  const CardContent = () => (
    <>
      <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 overflow-hidden bg-surface-2">
        {proxiedImageUrl && !imageError ? (
          <img
            src={proxiedImageUrl}
            alt={`${bakery.name} – cukrárna ${location}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl opacity-40">🍰</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-serif text-base font-semibold text-ink mb-0.5 truncate">
          {bakery.name}
        </div>
        <div className="text-sm text-text-muted truncate">{location}</div>
      </div>
    </>
  );

  const rowClasses =
    "flex gap-4 items-center p-3 bg-surface border border-hairline rounded-2xl hover:border-terracotta/40 transition-colors";

  if (bakery.website_url) {
    return (
      <a href={bakery.website_url} target="_blank" rel="noopener noreferrer" className={rowClasses}>
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
