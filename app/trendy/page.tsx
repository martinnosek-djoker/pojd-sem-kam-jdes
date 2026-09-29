import TrendingCard from "@/components/TrendingCard";
import Logo from "@/components/Logo";
import { getAllTrendings } from "@/lib/db";

// The mobile app builds with `output: 'export'` (fully static, no per-request
// server) — force-dynamic isn't compatible with that, so only force it on web,
// where the DB is queried fresh on every request instead of once at build time.
export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

export default async function TrendyPage() {
  const trendings = await getAllTrendings();

  return (
    <main className="min-h-screen px-4 sm:px-8 pb-8 bg-bg">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-hairline pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-ink mt-4 md:mt-6 mb-2">
            🔥 TOP 10 trendů
          </h1>
          <p className="text-sm md:text-lg text-text-muted mt-2">
            Nejžhavější tipy v pražské gastronomii od{" "}
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
            <p className="text-xl text-text-muted">Momentálně nejsou k dispozici žádné trendy</p>
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
