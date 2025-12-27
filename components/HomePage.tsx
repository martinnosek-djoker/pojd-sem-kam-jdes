"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import HappeningNow from "@/components/HappeningNow";

interface SectionCard {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

// SVG Icons
const FlameIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const RestaurantIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CoffeeIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h12v12a4 4 0 01-4 4H8a4 4 0 01-4-4V4zm12 4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
  </svg>
);

const CakeIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="5" y="13" width="14" height="4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <rect x="6" y="17" width="12" height="3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13c0-1 1-2 2-2h10c1 0 2 1 2 2" />
    <line x1="9" y1="11" x2="9" y2="7" strokeWidth={1.5} strokeLinecap="round" />
    <line x1="12" y1="11" x2="12" y2="6" strokeWidth={1.5} strokeLinecap="round" />
    <line x1="15" y1="11" x2="15" y2="7" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CompassIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function HomePage() {
  const sections: SectionCard[] = [
    {
      href: "/kuchyne",
      title: "TOP 10 trendů",
      description: "Nejžhavější tipy v pražské gastronomii",
      icon: <FlameIcon />,
      gradient: "from-orange-600/20 to-red-600/20 border-orange-500/30 hover:border-orange-400",
    },
    {
      href: "/michelin",
      title: "Michelin 2026",
      description: "Hvězdičkové restaurace a Bib Gourmand",
      icon: <StarIcon />,
      gradient: "from-yellow-600/20 to-amber-600/20 border-yellow-500/30 hover:border-yellow-400",
      badge: "Nové",
    },
    {
      href: "/kuchyne",
      title: "Restaurace",
      description: "Nejlepší restaurace podle typu kuchyně",
      icon: <RestaurantIcon />,
      gradient: "from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400",
    },
    {
      href: "/kavarny",
      title: "Kavárny",
      description: "Specialitní káva a útulná atmosféra",
      icon: <CoffeeIcon />,
      gradient: "from-amber-700/20 to-yellow-700/20 border-amber-600/30 hover:border-amber-500",
    },
    {
      href: "/cukrarny",
      title: "Cukrárny",
      description: "Nejlepší dorty a zákusky v Praze",
      icon: <CakeIcon />,
      gradient: "from-pink-600/20 to-rose-600/20 border-pink-500/30 hover:border-pink-400",
    },
    {
      href: "/lokality",
      title: "Podle lokality",
      description: "Najdi podniky ve své čtvrti",
      icon: <MapPinIcon />,
      gradient: "from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-400",
    },
    {
      href: "/pobliz",
      title: "V okolí",
      description: "Restaurace a kavárny poblíž",
      icon: <CompassIcon />,
      gradient: "from-green-600/20 to-emerald-600/20 border-green-500/30 hover:border-green-400",
    },
    {
      href: "/akce",
      title: "Gastro akce",
      description: "Food festivaly a kulinářské události",
      icon: <CalendarIcon />,
      gradient: "from-violet-600/20 to-purple-600/20 border-violet-500/30 hover:border-violet-400",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 px-4">
            Objevuj nejlepší gastro místa v Praze
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Osobní doporučení od{" "}
            <a
              href="https://www.instagram.com/pecu_si_zivot/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              @Peču si život
            </a>
          </p>
        </div>

        {/* Happening Now - Featured Events */}
        <div className="mb-12 sm:mb-16">
          <HappeningNow />
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`
                group relative overflow-hidden
                bg-gradient-to-br ${section.gradient}
                border-2 rounded-2xl
                p-6 sm:p-8
                transition-all duration-300
                hover:scale-105 hover:shadow-2xl hover:shadow-purple-900/30
                active:scale-95
                flex flex-col items-center justify-center
                min-h-[180px] sm:min-h-[200px]
                touch-manipulation
              `}
            >
              {/* Badge */}
              {section.badge && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full border-2 border-purple-400 shadow-lg">
                  {section.badge}
                </div>
              )}

              {/* Icon */}
              <div className="text-6xl sm:text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {section.icon}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
                {section.title}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 text-center leading-snug">
                {section.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Decorative corners */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/10 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-white/10 rounded-bl-2xl pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 sm:mt-20 text-center">
          <p className="text-gray-400 text-sm sm:text-base mb-4">
            Nenašel jsi co hledáš?
          </p>
          <a
            href="https://www.instagram.com/pecu_si_zivot/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>Sleduj mě na Instagramu</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
