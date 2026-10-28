import type { Event } from "@/lib/types";
import type { Locale } from "@/lib/i18n/LocaleContext";

// Event times are stored as wall-clock times written with a "Z" (see getHappeningNowEvents in
// lib/db.ts), so they are compared and formatted from the string itself, never through the
// time zone of whoever renders the page (a UTC server, a phone abroad).

/** Current Prague wall-clock time as "YYYY-MM-DDTHH:mm:ss". */
export function pragueNow(): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  return parts.replace(" ", "T");
}

/** Has the event finished? Events without any date are never hidden. */
export function isEventOver(event: Pick<Event, "start_date" | "end_date">, now: string = pragueNow()): boolean {
  if (event.end_date) return event.end_date.slice(0, 19) < now;
  // only a start date: it counts as over once that day is done
  if (event.start_date) return `${event.start_date.slice(0, 10)}T23:59:59` < now;
  return false;
}

/**
 * What the public events page shows: finished events are hidden. The order stays the manual one
 * from the admin (display_order); events with the same position go by start date.
 */
export function upcomingEvents(events: Event[], now: string = pragueNow()): Event[] {
  return events
    .filter((event) => !isEventOver(event, now))
    .sort(
      (a, b) =>
        a.display_order - b.display_order ||
        (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999") ||
        a.id - b.id
    );
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ymd = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
};

/**
 * Date label for the event badge, always with the year because events from several years are
 * mixed. cs: "9.4.-10.4.2027", "13.10.-18.11.2026", "20.12.2026-3.1.2027".
 * en: "9-10 Apr 2027", "13 Oct-18 Nov 2026", "20 Dec 2026-3 Jan 2027".
 */
export function formatEventDate(event: Pick<Event, "start_date" | "end_date" | "date">, locale: Locale): string {
  if (!event.start_date) return event.date || "";

  const s = ymd(event.start_date);
  const e = event.end_date ? ymd(event.end_date) : s;
  const sameDay = s.y === e.y && s.m === e.m && s.d === e.d;
  const sameYear = s.y === e.y;

  if (locale === "en") {
    if (sameDay) return `${s.d} ${MONTHS_EN[s.m - 1]} ${s.y}`;
    if (sameYear && s.m === e.m) return `${s.d}–${e.d} ${MONTHS_EN[s.m - 1]} ${s.y}`;
    if (sameYear) return `${s.d} ${MONTHS_EN[s.m - 1]}–${e.d} ${MONTHS_EN[e.m - 1]} ${s.y}`;
    return `${s.d} ${MONTHS_EN[s.m - 1]} ${s.y}–${e.d} ${MONTHS_EN[e.m - 1]} ${e.y}`;
  }

  if (sameDay) return `${s.d}.${s.m}.${s.y}`;
  if (sameYear) return `${s.d}.${s.m}.-${e.d}.${e.m}.${s.y}`;
  return `${s.d}.${s.m}.${s.y}-${e.d}.${e.m}.${e.y}`;
}
