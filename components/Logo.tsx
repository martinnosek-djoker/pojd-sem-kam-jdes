export default function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-3 justify-center">
      {/* Logo icon - Pinched fingers gesture (Italian hand) */}
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

          {/* Pinched fingers - Italian gesture */}
          <g className="animate-pulse-slow">
            {/* Palm/Wrist */}
            <ellipse cx="50" cy="75" rx="12" ry="18" fill="url(#gradient)" stroke="#a78bfa" strokeWidth="2" />

            {/* Thumb */}
            <path
              d="M 38 70 Q 35 60 35 50 Q 35 40 38 35 Q 40 32 42 30"
              fill="none"
              stroke="#c084fc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Index finger */}
            <path
              d="M 45 60 Q 44 45 45 30 Q 46 20 48 15"
              fill="none"
              stroke="#c084fc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Middle finger */}
            <path
              d="M 50 58 Q 50 40 50 25 Q 50 15 50 10"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Ring finger */}
            <path
              d="M 55 60 Q 56 45 55 30 Q 54 20 52 15"
              fill="none"
              stroke="#c084fc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Pinky */}
            <path
              d="M 62 70 Q 65 60 65 50 Q 65 40 62 35 Q 60 32 58 30"
              fill="none"
              stroke="#c084fc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Fingertips meeting point - emphasized */}
            <circle cx="50" cy="12" r="5" fill="#9333ea" opacity="0.3" />
            <circle cx="50" cy="12" r="2.5" fill="#c084fc" />
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
