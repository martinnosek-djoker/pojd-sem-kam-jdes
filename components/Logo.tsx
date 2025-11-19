export default function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-3 justify-center">
      {/* Logo icon - Map Pin with Food (fork & knife in plate) */}
      <div className="relative w-10 h-10 md:w-12 md:h-12">
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#e9d5ff', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Map Pin Shape */}
          <path
            d="M 50 10 C 35 10 23 22 23 37 C 23 52 50 85 50 85 C 50 85 77 52 77 37 C 77 22 65 10 50 10 Z"
            fill="url(#gradient)"
            className="animate-pulse-slow"
          />

          {/* Inner circle background */}
          <circle cx="50" cy="37" r="18" fill="#1a1a1a" />

          {/* Plate/Dish */}
          <ellipse cx="50" cy="42" rx="12" ry="3" fill="url(#gradient2)" opacity="0.6" />

          {/* Fork (left) */}
          <g transform="translate(42, 28)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-2" y1="0" x2="-2" y2="6" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="0" x2="2" y2="6" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="8" x2="0" y2="14" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Knife (right) */}
          <g transform="translate(58, 28)">
            <path d="M 0 0 L 1.5 8 L -1.5 8 Z" fill="#a78bfa" />
            <line x1="0" y1="8" x2="0" y2="14" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
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
