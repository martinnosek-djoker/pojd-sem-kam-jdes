"use client";

import { useEffect, useState } from "react";
import { Event } from "@/lib/types";
import { Calendar, MapPin, ExternalLink, Sparkles } from "lucide-react";

export default function HappeningNow() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingEvents() {
      try {
        const response = await fetch("/api/events/happening-now");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching happening now events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingEvents();
  }, []);

  if (loading) {
    return (
      <section className="mb-8 md:mb-12">
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2 md:mb-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-terracotta" />
              <h2 className="text-xl md:text-3xl font-serif font-bold text-ink tracking-wide">Aktuální gastro akce</h2>
            </div>
            <div className="h-10 w-28 bg-surface-2 rounded-md animate-pulse"></div>
          </div>
          <p className="text-sm md:text-base text-text-muted">Události začínající v nejbližších 3 dnech</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative bg-surface rounded-lg p-4 border border-hairline animate-pulse"
            >
              {/* Skeleton badge */}
              <div className="absolute -top-2 -right-2 h-6 w-12 bg-terracotta/40 rounded-full"></div>

              {/* Skeleton content */}
              <div className="space-y-3">
                {/* Title skeleton */}
                <div className="h-6 bg-surface-2 rounded w-3/4"></div>

                {/* Date skeleton */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-terracotta/30 rounded"></div>
                  <div className="h-4 bg-surface-2 rounded w-32"></div>
                </div>

                {/* Location skeleton */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-terracotta/30 rounded"></div>
                  <div className="h-4 bg-surface-2 rounded w-40"></div>
                </div>

                {/* Link skeleton */}
                <div className="h-4 bg-surface-2 rounded w-28 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null; // Don't show section if no events are happening
  }

  const isEventLive = (event: Event) => {
    if (!event.start_date || !event.end_date) return false;

    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);

    return start <= now && end >= now;
  };

  const formatEventDate = (event: Event) => {
    if (event.start_date && event.end_date) {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);

      const startDate = start.toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "numeric"
      });
      const endDate = end.toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "numeric"
      });

      if (startDate === endDate) {
        return startDate;
      }
      return `${startDate} - ${endDate}`;
    }

    return event.date || "";
  };

  return (
    <section className="mb-8 md:mb-12">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2 md:mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-terracotta" />
            <h2 className="text-xl md:text-3xl font-serif font-bold text-ink tracking-wide">Aktuální gastro akce</h2>
          </div>
          <a
            href="/akce"
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-md hover:bg-terracotta-dark transition-colors text-sm font-medium self-start md:self-auto"
          >
            Více akcí
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <p className="text-sm md:text-base text-text-muted">Události začínající v nejbližších 3 dnech</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="relative group bg-surface rounded-lg p-4 shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10 transition-all duration-200 border border-hairline"
          >
            {/* Highlight badge - only show LIVE for currently happening events */}
            {isEventLive(event) && (
              <div className="absolute -top-2 -right-2 bg-terracotta text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md animate-pulse">
                LIVE
              </div>
            )}

            {/* Event content */}
            <div className="space-y-2">
              {/* Event name */}
              <h3 className="font-serif font-bold text-lg text-ink pr-8">
                {event.name}
              </h3>

              {/* Date */}
              {(event.start_date || event.date) && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Calendar className="w-4 h-4 text-terracotta flex-shrink-0" />
                  <span>{formatEventDate(event)}</span>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin className="w-4 h-4 text-terracotta flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {/* Link */}
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-terracotta hover:text-terracotta-dark font-medium mt-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Více informací</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
