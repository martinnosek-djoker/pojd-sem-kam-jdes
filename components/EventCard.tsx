import { Event } from "@/lib/types";
import { Locale } from "@/lib/i18n/LocaleContext";

interface EventCardProps {
  event: Event;
  locale?: Locale;
}

// Deliberately not a client component: date formatting only needs to run
// once, on the server, and giving it "use client" for useLocale() caused a
// hydration mismatch (Date.toLocaleDateString can render a byte-for-byte
// different string between Node's ICU and the browser's).
export default function EventCard({ event, locale = "cs" }: EventCardProps) {
  const formatEventDate = () => {
    if (event.start_date && event.end_date) {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      const dateLocale = locale === "en" ? "en-GB" : "cs-CZ";

      const startDate = start.toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "numeric"
      }).replace(/\s/g, ''); // Remove spaces: "20. 11." -> "20.11."

      const endDate = end.toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "numeric"
      }).replace(/\s/g, '');

      if (startDate === endDate) {
        return startDate;
      }
      return `${startDate}-${endDate}`; // No spaces around dash
    }

    // Fallback to legacy date field
    return event.date || "";
  };

  const dateDisplay = formatEventDate();

  const CardContent = () => (
    <>
      {/* Banner: real photo/logo when available, otherwise a lively gradient */}
      <div className="relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br from-terracotta via-terracotta to-terracotta-dark">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-14 h-14 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Date badge overlaid on the banner */}
        {dateDisplay && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <svg className="w-4 h-4 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs sm:text-sm text-ink font-semibold whitespace-nowrap">
              {dateDisplay}
            </span>
          </div>
        )}

        {/* Link icon indicator */}
        {event.link && (
          <div className="absolute top-3 right-3 bg-surface/95 backdrop-blur-sm rounded-full p-2 shadow-md">
            <svg className="w-4 h-4 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-ink mb-1.5 tracking-wide group-hover:text-terracotta transition-colors">
          {event.name}
        </h3>

        {event.location && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-ink-mid flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-text-muted truncate">{event.location}</span>
          </div>
        )}
      </div>
    </>
  );

  if (event.link) {
    return (
      <a
        href={event.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-surface rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 border border-hairline hover:border-terracotta/40 group relative overflow-hidden cursor-pointer hover:-translate-y-1"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-lg shadow-black/5 transition-all duration-300 border border-hairline group relative overflow-hidden">
      <CardContent />
    </div>
  );
}
