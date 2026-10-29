"use client";

import { Cafe } from "@/lib/types";
import { usePlaceImage } from "@/lib/use-place-image";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import FavoriteButton from "@/components/FavoriteButton";
import { IS_STATIC_APP, placePath } from "@/lib/slug";
import { openDetail } from "@/lib/app-detail";
import { getDictionary, localizedSpecialty } from "@/lib/i18n/dictionaries";

interface CafeCardProps {
  showFavorite?: boolean; // star on the right; only the Restaurace/Kavárny lists turn it on
  cafe: Cafe;
  forceLocation?: string; // If provided, only show this location instead of all
}

const TAG_COLORS: Record<string, string> = {
  dezert: "bg-terracotta/10 text-terracotta",
  matcha: "bg-emerald-800/10 text-emerald-800",
  snídaně: "bg-sky-800/10 text-sky-800",
  "top-kava": "bg-amber-800/10 text-amber-800",
};

export default function CafeCard({ cafe, forceLocation, showFavorite = false }: CafeCardProps) {
  const locale = useLocale();
  const t = getDictionary(locale).kavarny;
  const tCommon = getDictionary(locale).common;
  const tagLabels: Record<string, string> = {
    dezert: t.tagDezert,
    matcha: t.tagMatcha,
    "snídaně": t.tagSnidane,
    "top-kava": t.tagTopKava,
  };
  const image = usePlaceImage(cafe.image_url, cafe.name, "cafes", 192);
  const location = forceLocation || cafe.location;

  const CardContent = () => (
    <>
      <div className={`w-[72px] h-[72px] rounded-xl flex-shrink-0 overflow-hidden ${image.src && !image.loaded ? "skeleton" : "bg-surface-2"}`}>
        {image.src ? (
          <img
            loading="lazy"
            decoding="async"
            src={image.src}
            alt={`${cafe.name} – ${tCommon.altCafe} ${location}`}
            ref={image.ref}
            onLoad={image.onLoad}
            onError={image.onError}
            className={`w-full h-full object-cover img-fade ${image.loaded ? "is-loaded" : ""}`}
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
        <div className="text-sm text-text-muted mb-1.5 truncate">
          {location}{localizedSpecialty(cafe, locale) ? ` · ${localizedSpecialty(cafe, locale)}` : ""}
        </div>
        {(cafe.rating != null || (cafe.tags && cafe.tags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {cafe.rating != null && (
              <span className="flex items-center gap-1 text-sm font-semibold text-ink mr-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#F2B84B" className="flex-shrink-0">
                  <path d="M12 2.5l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6 6.4 19.6l1.4-6.3-4.8-4.3 6.4-.6L12 2.5Z" />
                </svg>
                {cafe.rating}/10
              </span>
            )}
            {cafe.tags?.map((tag, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${TAG_COLORS[tag] || "bg-surface-2 text-ink-mid"}`}
              >
                {tagLabels[tag] || tag}
              </span>
            ))}
          </div>
        )}
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
      onClick={() => openDetail({ type: "place", kind: "cafe", place: cafe, locale })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openDetail({ type: "place", kind: "cafe", place: cafe, locale });
      }}
      className={`${rowClasses} cursor-pointer`}
    >
      <CardContent />
    </div>
  ) : (
    <Link href={placePath("cafe", cafe.name, cafe.id, locale)} scroll={false} className={rowClasses}>
      <CardContent />
    </Link>
  );

  if (!showFavorite) return card;

  return (
    <div className="relative">
      {card}
      <FavoriteButton kind="cafe" id={cafe.id} />
    </div>
  );
}
