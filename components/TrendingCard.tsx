import { Trending } from "@/lib/types";

interface TrendingCardProps {
  trending: Trending;
  rank: number;
}

export default function TrendingCard({ trending, rank }: TrendingCardProps) {
  const CardContent = () => (
    <>
      <div className="flex items-center gap-4">
        {/* Rank badge */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <span className="text-xl font-bold text-white">#{rank}</span>
        </div>

        {/* Name */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-purple-300 tracking-wide group-hover:text-purple-200 transition-colors">
            {trending.name}
          </h3>
        </div>

        {/* Arrow indicator if has link */}
        {trending.website_url && (
          <div className="flex-shrink-0 text-purple-400 group-hover:text-purple-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
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
