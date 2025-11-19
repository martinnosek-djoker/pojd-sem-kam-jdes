export default function LoadingPot() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      {/* Cooking pot animation */}
      <div className="relative">
        <svg
          viewBox="0 0 200 200"
          className="w-32 h-32 md:w-40 md:h-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="potGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Pot body */}
          <path
            d="M 60 80 L 50 140 Q 50 150 60 150 L 140 150 Q 150 150 150 140 L 140 80 Z"
            fill="url(#potGradient)"
            stroke="#a78bfa"
            strokeWidth="3"
          />

          {/* Pot handles */}
          <path
            d="M 50 90 Q 35 90 30 100"
            fill="none"
            stroke="#c084fc"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 150 90 Q 165 90 170 100"
            fill="none"
            stroke="#c084fc"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Pot lid */}
          <ellipse
            cx="100"
            cy="80"
            rx="45"
            ry="8"
            fill="#a78bfa"
            stroke="#9333ea"
            strokeWidth="2"
          />

          {/* Lid handle */}
          <ellipse
            cx="100"
            cy="70"
            rx="10"
            ry="6"
            fill="#c084fc"
            stroke="#9333ea"
            strokeWidth="2"
          />

          {/* Steam clouds - animated */}
          <g className="animate-pulse-slow">
            <ellipse
              cx="80"
              cy="50"
              rx="8"
              ry="12"
              fill="#e9d5ff"
              opacity="0.7"
            />
            <ellipse
              cx="100"
              cy="45"
              rx="10"
              ry="15"
              fill="#e9d5ff"
              opacity="0.6"
            />
            <ellipse
              cx="120"
              cy="50"
              rx="8"
              ry="12"
              fill="#e9d5ff"
              opacity="0.7"
            />
          </g>

          {/* More steam - delayed animation */}
          <g className="animate-pulse-slow" style={{ animationDelay: '0.5s' }}>
            <ellipse
              cx="90"
              cy="35"
              rx="6"
              ry="10"
              fill="#d8b4fe"
              opacity="0.5"
            />
            <ellipse
              cx="110"
              cy="35"
              rx="6"
              ry="10"
              fill="#d8b4fe"
              opacity="0.5"
            />
          </g>
        </svg>
      </div>

      {/* Loading text */}
      <p className="mt-6 text-xl font-semibold text-purple-400 animate-pulse">
        Vaříme pro vás...
      </p>
      <p className="mt-2 text-sm text-gray-400">
        Načítání dat
      </p>
    </div>
  );
}
