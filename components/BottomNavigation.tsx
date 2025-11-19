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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// Better bakery icon - Croissant
const BakeryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8c-1.5-2-4-3-7-3S7.5 6 6 8c-1 1.5-1 3-.5 4.5.5 1.5 1.5 2.5 3 3.5 1.5 1 3.5 1.5 5.5 1.5s4-.5 5.5-1.5c1.5-1 2.5-2 3-3.5.5-1.5.5-3-.5-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10c1-1 2.5-1.5 4-1.5s3 .5 4 1.5M9 13c.5-.5 1.5-1 3-1s2.5.5 3 1" />
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
    { href: '/cukrarny', label: 'Cukrárny', icon: BakeryIcon },
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
                    <span className="px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded-full border-2 border-purple-400 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation - SUBTLE PURPLE */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-200 shadow-lg z-30 safe-area-inset-bottom">
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
                    ? 'bg-purple-600 text-white scale-105 shadow-md'
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <IconComponent />
                <span className={`text-[10px] mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* Více Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-[68px] ${
              showMoreMenu || isMoreMenuActive
                ? 'bg-purple-600 text-white scale-105 shadow-md'
                : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <MenuIcon />
            <span className={`text-[10px] mt-1 font-medium ${(showMoreMenu || isMoreMenuActive) ? 'font-semibold' : ''}`}>
              Více
            </span>
            {(showMoreMenu || isMoreMenuActive) && (
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
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
