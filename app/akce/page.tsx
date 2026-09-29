import Logo from "@/components/Logo";
import EventCard from "@/components/EventCard";
import { getAllEvents } from "@/lib/db";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-hairline pb-3 sm:pb-4 md:pb-6 mb-3 sm:mb-4">
            <Logo />
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-ink mb-2 sm:mb-3 md:mb-4">
            Gastro akce
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-text-muted">
            Nejlepší gastro akce v Praze a okolí
          </p>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-text-muted">
              Momentálně nejsou k dispozici žádné akce.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
