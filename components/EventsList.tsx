"use client";

import { useEffect, useMemo, useState } from "react";
import EventCard from "@/components/EventCard";
import { Event } from "@/lib/types";
import { Locale } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getApiUrl } from "@/lib/api-config";
import { upcomingEvents } from "@/lib/events";

const CACHE_KEY = "events:v1";

interface EventsListProps {
  locale: Locale;
  events: Event[];
  // The native app is a static export: it has no events baked in (a build would freeze whatever
  // the database held that day) and loads them live from the website instead.
  live?: boolean;
}

export default function EventsList({ locale, events: initialEvents, live = false }: EventsListProps) {
  const t = getDictionary(locale).akce;
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(live);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;

    // Last known list first, so a reopened app (or a bad connection) is not empty
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setEvents(JSON.parse(cached));
        setLoading(false);
      }
    } catch {
      // storage unavailable - just wait for the network
    }

    fetch(getApiUrl("/api/events"))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Event[]) => {
        if (cancelled || !Array.isArray(data)) return;
        setEvents(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          // ignore
        }
      })
      .catch((error) => console.error("Error loading events:", error))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [live]);

  // Finished events stay out; computed here (not at build time) so it is right whenever the page opens
  const visible = useMemo(() => upcomingEvents(events), [events]);

  if (loading && visible.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-hairline bg-surface overflow-hidden">
            <div className="h-40 sm:h-44 skeleton" />
            <div className="p-4 sm:p-5 space-y-2">
              <div className="h-5 w-2/3 rounded skeleton" />
              <div className="h-4 w-1/3 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-text-muted">{t.emptyTitle}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
      {visible.map((event) => (
        <EventCard key={event.id} event={event} locale={locale} />
      ))}
    </div>
  );
}
