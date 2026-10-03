"use client";

import { useFavorites, type FavoriteKind } from "@/lib/favorites";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

// Sits over the right edge of a card (outside the card's link, so a tap on the
// star never opens the detail).
export default function FavoriteButton({ kind, id }: { kind: FavoriteKind; id: number }) {
  const { isFavorite, toggle } = useFavorites(kind);
  const t = getDictionary(useLocale()).common;
  const active = isFavorite(id);

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={active}
      aria-label={active ? t.removeFavorite : t.addFavorite}
      title={active ? t.removeFavorite : t.addFavorite}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-terracotta/10 active:scale-90 transition-all"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className={active ? "text-[#F2B84B]" : "text-ink-mid/60"}>
        <path
          d="M12 2.5l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6 6.4 19.6l1.4-6.3-4.8-4.3 6.4-.6L12 2.5Z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
