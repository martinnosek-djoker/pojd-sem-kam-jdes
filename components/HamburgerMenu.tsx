"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide menu on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { href: "/", label: "Domů" },
    { href: "/pobliz", label: "Ve tvém okolí" },
    { href: "/lokality", label: "Podle lokalit" },
    { href: "/kuchyne", label: "Světové kuchyně" },
    { href: "/cukrarny", label: "Cukrárny", badge: "Nové" },
    { href: "/kavarny", label: "Kavárny", badge: "Brzy" },
    { href: "/akce", label: "Gastro akce", badge: "Brzy" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 left-6 z-50 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg transition-all duration-300 border border-purple-500"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          // Křížek
          <div className="w-6 h-6 relative">
            <span className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform rotate-45" />
            <span className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -rotate-45" />
          </div>
        ) : (
          // Hamburger
          <div className="w-6 h-6 flex flex-col justify-between">
            <span className="block h-0.5 bg-white" />
            <span className="block h-0.5 bg-white" />
            <span className="block h-0.5 bg-white" />
          </div>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-r border-purple-500/30 shadow-2xl z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-8 px-6">
          {/* Menu Items */}
          <ul className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive(item.href)
                      ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                      : "text-gray-300 hover:bg-purple-600/10 hover:text-purple-400 border border-transparent"
                  }`}
                >
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
