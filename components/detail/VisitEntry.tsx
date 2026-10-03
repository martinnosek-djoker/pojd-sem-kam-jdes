import Link from "next/link";
import type { Visit } from "@/lib/types";
import type { Locale } from "@/lib/i18n/LocaleContext";
import { getDictionary, formatLongDate } from "@/lib/i18n/dictionaries";
import { visitPath } from "@/lib/slug";
import PhotoGallery from "./PhotoGallery";

interface VisitEntryProps {
  visit: Visit;
  locale: Locale;
  placeName: string;
  // On the place page each visit links to its own page; on the visit page itself it doesn't.
  showPermalink?: boolean;
  headingLevel?: "h2" | "h3";
}

export default function VisitEntry({ visit, locale, placeName, showPermalink = true, headingLevel = "h3" }: VisitEntryProps) {
  const t = getDictionary(locale).detail;
  const comment = locale === "en" ? visit.comment_en || visit.comment : visit.comment;
  const dishes = locale === "en" ? visit.dishes_en || visit.dishes : visit.dishes;
  const photos = visit.images || [];
  const Heading = headingLevel;

  return (
    <article className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6 shadow-md shadow-black/5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <Heading className="font-serif text-lg font-semibold text-ink">
          {t.visitedOn(formatLongDate(visit.visit_date, locale))}
        </Heading>
        {visit.overall_rating != null && (
          <span className="flex items-center gap-1 text-sm font-semibold text-ink" title={t.overallRating}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F2B84B" aria-hidden="true">
              <path d="M12 2.5l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6 6.4 19.6l1.4-6.3-4.8-4.3 6.4-.6L12 2.5Z" />
            </svg>
            {visit.overall_rating}/10
          </span>
        )}
      </div>

      {comment && <p className="text-ink-mid italic leading-relaxed mb-4">&quot;{comment}&quot;</p>}

      {dishes && dishes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">{t.tried}</p>
          <ul className="flex flex-wrap gap-2">
            {dishes.map((dish, i) => (
              <li key={i} className="px-3 py-1 bg-surface-2 text-ink-mid text-sm rounded-full">
                {dish.name}
                {dish.rating ? <span className="text-terracotta font-semibold"> {dish.rating}/10</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {photos.length > 0 && (
        <div className="mb-4">
          <PhotoGallery photos={photos} altBase={placeName} photoWord={t.photoWord} />
        </div>
      )}

      {showPermalink && (
        <Link
          href={visitPath(placeName, visit.visit_date, visit.id, locale)}
          scroll={false}
          className="text-sm font-semibold text-terracotta hover:text-terracotta-dark transition-colors"
        >
          {t.fullVisit}
        </Link>
      )}
    </article>
  );
}
