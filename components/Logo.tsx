export default function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo icon - two arrows meeting, representing "Come here!" and "Where are you going?" */}
      <div className="relative w-24 h-24">
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

            <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Left arrow - "Pojď sem!" (Come here) */}
          <g className="animate-pulse-slow">
            <path
              d="M 25 35 L 40 50 L 25 65"
              stroke="url(#arrowGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <line
              x1="40"
              y1="50"
              x2="15"
              y2="50"
              stroke="url(#arrowGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Right arrow - "Kam jdeš?" (Where are you going?) */}
          <g className="animate-pulse-slow" style={{ animationDelay: '0.5s' }}>
            <path
              d="M 75 35 L 60 50 L 75 65"
              stroke="url(#arrowGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <line
              x1="60"
              y1="50"
              x2="85"
              y2="50"
              stroke="url(#arrowGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Central dot - meeting point */}
          <circle
            cx="50"
            cy="50"
            r="6"
            fill="#a78bfa"
            className="animate-ping-slow"
          />
          <circle
            cx="50"
            cy="50"
            r="6"
            fill="#c084fc"
          />
        </svg>
      </div>

      {/* Logo text */}
      <h1 className="text-4xl md:text-5xl font-bold text-purple-400 tracking-widest text-center">
        <span className="block sm:inline">Pojď sem!</span>
        <span className="hidden sm:inline mx-2">•</span>
        <span className="block sm:inline">Kam jdeš?</span>
      </h1>
    </div>
  );
}
