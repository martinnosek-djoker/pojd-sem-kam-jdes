"use client";

import { useState, useEffect } from "react";

export default function BetaTesterBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem("betaTesterBannerDismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("betaTesterBannerDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium">
              <span className="font-bold">Android aplikace v přípravě!</span>
              {" "}
              <span className="hidden sm:inline">Staň se interním testerem! </span>
              Pošli svou emailovou adresu na{" "}
              <a
                href="mailto:nosekm0@gmail.com?subject=Zájem o beta testování Android aplikace"
                className="underline hover:text-purple-200 transition-colors font-semibold"
              >
                nosekm0@gmail.com
              </a>
              {" "}nebo na{" "}
              <a
                href="https://www.instagram.com/pecu_si_zivot/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-purple-200 transition-colors font-semibold"
              >
                Instagram
              </a>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-purple-800 transition-colors"
            aria-label="Zavřít banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
