"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Hide navigation on admin pages
  if (pathname.includes('/admin')) {
    return null;
  }

  const mainItems = [
    { href: '/', label: 'Domů', icon: '🏠' },
    { href: '/pobliz', label: 'Okolí', icon: '📍' },
    { href: '/kavarny', label: 'Kavárny', icon: '☕' },
    { href: '/cukrarny', label: 'Cukrárny', icon: '🍰' },
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
          <div className="fixed bottom-20 left-0 right-0 z-50 mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-2">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMoreMenu(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive(item.href)
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-semibold bg-purple-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
          {mainItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-[72px] ${
                  active
                    ? 'text-purple-600 scale-105'
                    : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50'
                }`}
              >
                <span className="text-2xl mb-1 transform transition-transform">{item.icon}</span>
                <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-purple-600 mt-1" />
                )}
              </Link>
            );
          })}

          {/* Více Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-[72px] ${
              showMoreMenu || isMoreMenuActive
                ? 'text-purple-600 scale-105'
                : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50'
            }`}
          >
            <span className="text-2xl mb-1">☰</span>
            <span className={`text-xs font-medium ${(showMoreMenu || isMoreMenuActive) ? 'font-semibold' : ''}`}>
              Více
            </span>
            {(showMoreMenu || isMoreMenuActive) && (
              <div className="w-1 h-1 rounded-full bg-purple-600 mt-1" />
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
