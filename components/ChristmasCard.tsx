import { ChristmasTip } from "@/lib/types";

interface ChristmasCardProps {
  tip: ChristmasTip;
}

export default function ChristmasCard({ tip }: ChristmasCardProps) {
  return (
    <a
      href={tip.shop_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg shadow-purple-900/10 hover:shadow-purple-600/30 transition-all duration-300 p-4 border border-purple-600/30 hover:border-purple-500/50 group cursor-pointer hover:scale-105"
    >
      <div className="flex flex-col gap-3">
        {/* Image */}
        {tip.image_url ? (
          <div className="relative w-full h-40 overflow-hidden rounded-lg">
            <img
              src={tip.image_url}
              alt={tip.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        ) : (
          <div className="relative w-full h-40 overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/20 to-gray-900/40 flex items-center justify-center">
            <span className="text-6xl opacity-20">🎄</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-purple-300 tracking-wide group-hover:text-purple-200 transition-colors mb-2">
            {tip.name}
          </h3>
          {tip.description && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {tip.description}
            </p>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-purple-400 font-semibold uppercase tracking-wide">
            Navštívit eshop
          </span>
          <div className="text-purple-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}
