"use client";

import { Restaurant } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { useState } from "react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  forceLocation?: string; // If provided, only show this location instead of all
}

function getPriceInfo(price: number) {
  if (price === 0) return "Cena neuvedena";
  if (price < 500) return "Do 500 Kč";
  if (price < 1000) return "500-1000 Kč";
  if (price < 2000) return "1000-2000 Kč";
  return "2000+ Kč";
}

export default function RestaurantCard({ restaurant, forceLocation }: RestaurantCardProps) {
  const proxiedImageUrl = getProxiedImageUrl(restaurant.image_url, restaurant.name);
  const [imageError, setImageError] = useState(false);
  const location = forceLocation || restaurant.location;

  const CardContent = () => (
    <>
      <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 overflow-hidden bg-surface-2">
        {proxiedImageUrl && !imageError ? (
          <img
            src={proxiedImageUrl}
            alt={`${restaurant.name} – restaurace ${location}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl opacity-40">🍽️</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-serif text-base font-semibold text-ink mb-0.5 truncate">
          {restaurant.name}
        </div>
        <div className="text-sm text-text-muted mb-1.5 truncate">
          {location} · {restaurant.cuisine_type}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm font-semibold text-ink">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F2B84B" className="flex-shrink-0">
              <path d="M12 2.5l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6 6.4 19.6l1.4-6.3-4.8-4.3 6.4-.6L12 2.5Z" />
            </svg>
            {restaurant.rating}/10
          </span>
          <span className="text-xs font-semibold bg-surface-2 text-ink-mid px-2.5 py-1 rounded-full whitespace-nowrap">
            {getPriceInfo(restaurant.price)}
          </span>
        </div>
      </div>
    </>
  );

  const rowClasses =
    "flex gap-4 items-center p-3 bg-surface border border-hairline rounded-2xl hover:border-terracotta/40 transition-colors";

  if (restaurant.website_url) {
    return (
      <a href={restaurant.website_url} target="_blank" rel="noopener noreferrer" className={rowClasses}>
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
