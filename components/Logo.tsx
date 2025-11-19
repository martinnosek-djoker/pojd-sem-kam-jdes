export default function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-3 justify-center">
      {/* Logo icon - Simple pinched fingers gesture */}
      <div className="relative w-10 h-10 md:w-12 md:h-12">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          <g className="animate-pulse-slow">
            {/* Simple hand silhouette - palm */}
            <ellipse cx="50" cy="70" rx="18" ry="25" fill="url(#gradient)" />

            {/* Thumb - curved outward */}
            <ellipse cx="30" cy="60" rx="7" ry="18" fill="#c084fc" transform="rotate(-25 30 60)" />

            {/* Four fingers pointing up and slightly inward */}
            <ellipse cx="42" cy="35" rx="5" ry="22" fill="#a78bfa" transform="rotate(-8 42 35)" />
            <ellipse cx="50" cy="30" rx="5" ry="25" fill="#c084fc" />
            <ellipse cx="58" cy="35" rx="5" ry="22" fill="#a78bfa" transform="rotate(8 58 35)" />
            <ellipse cx="66" cy="42" rx="4.5" ry="18" fill="#9333ea" transform="rotate(12 66 42)" />

            {/* Fingertips glow - pinched together at top */}
            <circle cx="50" cy="15" r="8" fill="#9333ea" opacity="0.4" />
            <circle cx="50" cy="15" r="4" fill="#e9d5ff" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Logo text - HORIZONTAL */}
      <h1 className="text-base sm:text-lg md:text-2xl font-bold text-purple-400 tracking-wide leading-tight">
        Pojď sem! Kam jdeš?
      </h1>
    </div>
  );
}
