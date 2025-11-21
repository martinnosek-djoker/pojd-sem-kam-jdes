"use client";

import { useEffect, useState } from "react";
import { Event } from "@/lib/types";
import { Calendar, MapPin, ExternalLink, Clock } from "lucide-react";

export default function HappeningNow() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHappeningNowEvents() {
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

    fetchHappeningNowEvents();
  }, []);

  if (loading) {
    return (
      <section className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Právě probíhá</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null; // Don't show section if no events are happening
  }

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-purple-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">Právě probíhá</h2>
        </div>
        <a
          href="/akce"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Více akcí
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="relative group bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-purple-100"
          >
            {/* Highlight badge */}
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              LIVE
            </div>

            {/* Event content */}
            <div className="space-y-2">
              {/* Event name */}
              <h3 className="font-bold text-lg text-gray-900 pr-8">
                {event.name}
              </h3>

              {/* Date */}
              {(event.start_date || event.date) && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>{formatEventDate(event)}</span>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {/* Link */}
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
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
