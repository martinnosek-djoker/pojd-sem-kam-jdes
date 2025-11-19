"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Modern SVG Icons
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CoffeeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h12v12a4 4 0 01-4 4H8a4 4 0 01-4-4V4zm12 4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
  </svg>
);

const CakeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.696 2.696 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h6l-1 9H9L9 3z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function BottomNavigation() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Hide navigation on admin pages
  if (pathname.includes('/admin')) {
    return null;
  }

  const mainItems = [
    { href: '/', label: 'Domů', icon: HomeIcon },
    { href: '/pobliz', label: 'Okolí', icon: MapPinIcon },
    { href: '/kavarny', label: 'Kavárny', icon: CoffeeIcon },
    { href: '/cukrarny', label: 'Cukrárny', icon: CakeIcon },
  ];

  const moreItems = [
    { href: '/lokality', label: 'Podle lokality' },
    { href: '/kuchyne', label: 'Světové kuchyně' },
    { href: '/akce', label: 'Gastro akce', badge: 'Nové' },
  ];

  const isActive = (href: string) => {
    const normalizedPathname = pathname.replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return normalizedPathname === normalizedHref ||
           (normalizedHref !== '/' && normalizedPathname.startsWith(normalizedHref + '/'));
  };

  const isMoreMenuActive = moreItems.some(item => isActive(item.href));

  return (
    <>
      {/* Více Menu Overlay */}
      {showMoreMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="fixed bottom-20 left-0 right-0 z-50 mx-4 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp border border-purple-200">
            <div className="p-2">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMoreMenu(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive(item.href)
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-semibold bg-white text-purple-600 rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation - PURPLE GRADIENT */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 z-30 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {mainItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-[68px] ${
                  active
                    ? 'bg-white/20 backdrop-blur-sm text-white scale-105'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComponent />
                <span className={`text-[10px] mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5 shadow-sm" />
                )}
              </Link>
            );
          })}

          {/* Více Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-[68px] ${
              showMoreMenu || isMoreMenuActive
                ? 'bg-white/20 backdrop-blur-sm text-white scale-105'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <MenuIcon />
            <span className={`text-[10px] mt-1 font-medium ${(showMoreMenu || isMoreMenuActive) ? 'font-semibold' : ''}`}>
              Více
            </span>
            {(showMoreMenu || isMoreMenuActive) && (
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5 shadow-sm" />
            )}
          </button>
        </div>
      </nav>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        /* Safe area for iOS notch/home indicator */
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
