"use client";

import { Cafe } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { IS_STATIC_APP, placePath } from "@/lib/slug";
import { getDictionary } from "@/lib/i18n/dictionaries";

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

export default function CafeCard({ cafe, forceLocation }: CafeCardProps) {
  const locale = useLocale();
  const t = getDictionary(locale).kavarny;
  const tCommon = getDictionary(locale).common;
  const tagLabels: Record<string, string> = {
    dezert: t.tagDezert,
    matcha: t.tagMatcha,
    "snídaně": t.tagSnidane,
    "top-kava": t.tagTopKava,
  };
  const proxiedImageUrl = getProxiedImageUrl(cafe.image_url, cafe.name, "cafes");
  const [imageError, setImageError] = useState(false);
  const location = forceLocation || cafe.location;

  const CardContent = () => (
    <>
      <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 overflow-hidden bg-surface-2">
        {proxiedImageUrl && !imageError ? (
          <img
            src={proxiedImageUrl}
            alt={`${cafe.name} – ${tCommon.altCafe} ${location}`}
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
        <div className="text-sm text-text-muted mb-1.5 truncate">
          {location}{cafe.specialty ? ` · ${cafe.specialty}` : ""}
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

  const rowClasses =
    "flex gap-4 items-center p-3 bg-surface border border-hairline rounded-2xl hover:border-terracotta/40 transition-colors";

  // The native app is a static export without the detail pages, so it keeps linking out.
  if (IS_STATIC_APP && cafe.website_url) {
    return (
      <a href={cafe.website_url} target="_blank" rel="noopener noreferrer" className={rowClasses}>
        <CardContent />
      </a>
    );
  }

  if (!IS_STATIC_APP) {
    return (
      <Link href={placePath("cafe", cafe.name, cafe.id, locale)} scroll={false} className={rowClasses}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div className={rowClasses}>
      <CardContent />
    </div>
  );
}
