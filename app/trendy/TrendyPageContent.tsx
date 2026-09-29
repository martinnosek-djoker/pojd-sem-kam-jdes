import TrendingCard from "@/components/TrendingCard";
import Logo from "@/components/Logo";
import { Trending } from "@/lib/types";
import { Locale } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface TrendyPageContentProps {
  locale?: Locale;
  trendings: Trending[];
}

// No interactivity here, so this stays a plain (server-renderable) function
// shared between the cs and en pages, instead of a "use client" wrapper.
export default function TrendyPageContent({ locale = "cs", trendings }: TrendyPageContentProps) {
  const t = getDictionary(locale).trendy;

  return (
    <main className="min-h-screen px-4 sm:px-8 pb-8 bg-bg">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-hairline pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-ink mt-4 md:mt-6 mb-2">
            {t.title}
          </h1>
          <p className="text-sm md:text-lg text-text-muted mt-2">
            {t.subtitlePrefix}{" "}
            <a
              href="https://www.instagram.com/pecu_si_zivot/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta hover:text-terracotta-dark transition-colors font-semibold"
            >
              @Peču si život
            </a>
          </p>
        </div>

        {/* Trending list */}
        {trendings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-text-muted">{t.emptyTitle}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendings.map((trending, index) => (
              <TrendingCard key={trending.id} trending={trending} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
