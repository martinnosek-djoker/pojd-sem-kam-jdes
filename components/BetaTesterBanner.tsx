"use client";

export default function BetaTesterBanner() {
  return (
    <a
      href="/vanoce"
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg block hover:from-purple-700 hover:to-purple-800 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium">
              <span className="font-bold">🎄 Připrav se s námi na Vánoce se vším všudy!</span>
              {" "}
              Cukroví, vánočky a dárky na jednom místě.
            </p>
          </div>
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}
