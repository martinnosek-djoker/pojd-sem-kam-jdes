"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import EventCard from "@/components/EventCard";
import { Event } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(getApiUrl("/api/events"));
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 sm:pb-4 md:pb-6 mb-3 sm:mb-4">
            <Logo />
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-2 sm:mb-3 md:mb-4">
            Gastro akce
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            Nejlepší gastro akce v Praze a okolí
          </p>
        </div>

        {loading ? (
          <LoadingPot />
        ) : events && events.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {events.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">
              Momentálně nejsou k dispozici žádné akce.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
