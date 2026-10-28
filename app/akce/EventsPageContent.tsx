import Logo from "@/components/Logo";
import EventsList from "@/components/EventsList";
import { Event } from "@/lib/types";
import { Locale } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface EventsPageContentProps {
  locale?: Locale;
  events: Event[];
  live?: boolean; // native app: load the events live instead of using a baked-in list
}

// No interactivity, so this stays a plain (server-renderable) function
// shared between the cs and en pages.
export default function EventsPageContent({ locale = "cs", events, live = false }: EventsPageContentProps) {
  const t = getDictionary(locale).akce;

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
            {t.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-text-muted">
            {t.subtitle}
          </p>
        </div>

        <EventsList locale={locale} events={events} live={live} />
      </div>
    </main>
  );
}
