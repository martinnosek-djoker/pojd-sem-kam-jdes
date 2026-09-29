import { getAllEvents } from "@/lib/db";
import EventsPageContent from "@/app/akce/EventsPageContent";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function EnglishEventsPage() {
  const events = await getAllEvents();

  return <EventsPageContent locale="en" events={events} />;
}
