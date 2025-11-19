export default function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-3 justify-center">
      {/* Logo icon - Fork & Knife (food-themed) */}
      <div className="relative w-10 h-10 md:w-12 md:h-12">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="url(#gradient)"
            className="opacity-20"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Fork */}
          <g className="animate-pulse-slow">
            {/* Fork prongs */}
            <line x1="35" y1="20" x2="35" y2="45" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="20" x2="40" y2="45" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="20" x2="45" y2="45" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
            {/* Fork handle */}
            <line x1="40" y1="45" x2="40" y2="75" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
            <circle cx="40" cy="78" r="3" fill="#c084fc" />
          </g>

          {/* Knife */}
          <g className="animate-pulse-slow" style={{ animationDelay: '0.5s' }}>
            {/* Knife blade */}
            <path d="M 60 20 L 65 45 L 55 45 Z" fill="#c084fc" />
            {/* Knife handle */}
            <line x1="60" y1="45" x2="60" y2="75" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" />
            <circle cx="60" cy="78" r="3" fill="#a78bfa" />
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
