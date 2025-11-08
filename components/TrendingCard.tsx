import { Trending } from "@/lib/types";

interface TrendingCardProps {
  trending: Trending;
  rank: number;
}

export default function TrendingCard({ trending, rank }: TrendingCardProps) {
  const CardContent = () => (
    <>
      <div className="flex items-center gap-0 relative overflow-hidden">
        {/* Image section - left side */}
        {trending.image_url ? (
          <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden">
            <img
              src={trending.image_url}
              alt={trending.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900"></div>
            {/* Rank badge overlaid on image */}
            <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">#{rank}</span>
            </div>
          </div>
        ) : (
          <div className="relative w-32 h-24 flex-shrink-0 bg-gradient-to-br from-purple-900/30 to-gray-900/50 flex items-center justify-center">
            <span className="text-4xl opacity-30">🔥</span>
            {/* Rank badge overlaid */}
            <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">#{rank}</span>
            </div>
          </div>
        )}

        {/* Content section - right side */}
        <div className="flex-1 px-4 py-3 flex items-center justify-between">
          {/* Name */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-purple-300 tracking-wide group-hover:text-purple-200 transition-colors">
              {trending.name}
            </h3>
          </div>

          {/* Arrow indicator if has link */}
          {trending.website_url && (
            <div className="flex-shrink-0 text-purple-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (trending.website_url) {
    return (
      <a
        href={trending.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg shadow-purple-900/10 hover:shadow-purple-600/30 transition-all duration-300 p-4 border border-purple-600/30 hover:border-purple-500/50 group cursor-pointer hover:scale-102"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg shadow-purple-900/10 p-4 border border-purple-600/30 group">
      <CardContent />
    </div>
  );
}
