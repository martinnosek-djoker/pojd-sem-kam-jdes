export default function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-3 justify-center">
      {/* Logo icon - Hand gesture "come here" */}
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

          {/* Hand - "Come here" gesture */}
          <g className="animate-pulse-slow">
            {/* Palm */}
            <path
              d="M 30 60 Q 30 40 35 35 L 45 35 L 45 25 Q 45 20 50 20 Q 55 20 55 25 L 55 30 L 60 30 Q 65 30 65 35 Q 65 40 60 40 L 55 40 L 55 50 L 70 50 Q 75 50 75 55 Q 75 60 70 60 L 55 60 L 55 75 Q 55 80 50 80 Q 45 80 45 75 L 45 60 L 30 60 Z"
              fill="url(#gradient)"
              stroke="#a78bfa"
              strokeWidth="2"
            />

            {/* Finger 1 - Index */}
            <path
              d="M 50 20 L 50 10 Q 50 5 52 5 Q 54 5 54 10 L 54 25"
              fill="#c084fc"
              stroke="#a78bfa"
              strokeWidth="2"
            />

            {/* Motion lines - suggesting "come here" movement */}
            <line x1="15" y1="45" x2="25" y2="45" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="12" y1="55" x2="22" y2="55" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="15" y1="65" x2="25" y2="65" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
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
