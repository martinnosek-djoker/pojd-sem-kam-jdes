"use client";

import { Restaurant } from "@/lib/types";
import { usePlaceImage } from "@/lib/use-place-image";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import FavoriteButton from "@/components/FavoriteButton";
import { IS_STATIC_APP, placePath } from "@/lib/slug";
import { openDetail } from "@/lib/app-detail";
import { formatPrice, getPriceBadgeClasses, translateCuisineType, getDictionary } from "@/lib/i18n/dictionaries";

interface RestaurantCardProps {
  showFavorite?: boolean; // star on the right; only the Restaurace/Kavárny lists turn it on
  restaurant: Restaurant;
  forceLocation?: string; // If provided, only show this location instead of all
}

export default function RestaurantCard({ restaurant, forceLocation, showFavorite = false }: RestaurantCardProps) {
  const locale = useLocale();
  const t = getDictionary(locale).common;
  const image = usePlaceImage(restaurant.image_url, restaurant.name);
  const location = forceLocation || restaurant.location;

  const CardContent = () => (
    <>
      <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 overflow-hidden bg-surface-2">
        {image.src ? (
          <img
            src={image.src}
            alt={`${restaurant.name} – ${t.altRestaurant} ${location}`}
            ref={image.ref}
            onLoad={image.onLoad}
            onError={image.onError}
            className={`w-full h-full object-cover img-fade ${image.loaded ? "is-loaded" : ""}`}
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
          {location} · {translateCuisineType(restaurant.cuisine_type, locale)}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm font-semibold text-ink">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F2B84B" className="flex-shrink-0">
              <path d="M12 2.5l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6 6.4 19.6l1.4-6.3-4.8-4.3 6.4-.6L12 2.5Z" />
            </svg>
            {restaurant.rating}/10
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getPriceBadgeClasses(restaurant.price)}`}>
            {formatPrice(restaurant.price, locale)}
          </span>
        </div>
      </div>
    </>
  );

  const rowClasses = `flex gap-4 items-center p-3 bg-surface border border-hairline rounded-2xl hover:border-terracotta/40 transition-all active:scale-[0.985] ${
    showFavorite ? "pr-12" : ""
  }`;

  // The native app has no per-place routes (static export), so a tap opens the same detail
  // in an in-app dialog instead (see AppDetailHost).
  const card = IS_STATIC_APP ? (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openDetail({ type: "place", kind: "restaurant", place: restaurant, locale })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openDetail({ type: "place", kind: "restaurant", place: restaurant, locale });
      }}
      className={`${rowClasses} cursor-pointer`}
    >
      <CardContent />
    </div>
  ) : (
    <Link href={placePath("restaurant", restaurant.name, restaurant.id, locale)} scroll={false} className={rowClasses}>
      <CardContent />
    </Link>
  );

  if (!showFavorite) return card;

  return (
    <div className="relative">
      {card}
      <FavoriteButton kind="restaurant" id={restaurant.id} />
    </div>
  );
}
