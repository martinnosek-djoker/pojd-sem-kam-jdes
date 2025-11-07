import { Restaurant } from "@/lib/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-purple-400 text-lg">★</span>
        ))}
        {halfStar && <span className="text-purple-400 text-lg">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-700 text-lg">☆</span>
        ))}
        <span className="text-sm text-gray-400 ml-1">{restaurant.rating}/10</span>
      </div>
    );
  };

  const getPriceInfo = (price: number) => {
    if (price === 0) return { label: "Cena neuvedena", color: "bg-gray-800/40 text-gray-300 border-gray-600/40" };
    if (price < 500) return { label: "Do 500 Kč", color: "bg-emerald-900/40 text-emerald-300 border-emerald-600/40" };
    if (price < 1000) return { label: "500-1000 Kč", color: "bg-blue-900/40 text-blue-300 border-blue-600/40" };
    if (price < 2000) return { label: "1000-2000 Kč", color: "bg-amber-900/40 text-amber-300 border-amber-600/40" };
    return { label: "2000+ Kč", color: "bg-rose-900/40 text-rose-300 border-rose-600/40" };
  };

  const CardContent = () => (
    <>
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-purple-600/30"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-purple-700/20"></div>

      <div className="mb-4 relative">
        <h3 className="text-xl font-bold text-purple-300 mb-1 tracking-wide group-hover:text-purple-200 transition-colors">
          {restaurant.name}
        </h3>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-sm">📍</span>
          <span className="text-sm tracking-wide">{restaurant.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded border border-purple-700/30">
            {restaurant.cuisine_type}
          </span>
        </div>

        {restaurant.specialty && (
          <p className="text-sm text-gray-400 italic border-l-2 border-purple-800/50 pl-3">
            {restaurant.specialty}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-purple-900/30 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">{renderStars(restaurant.rating)}</div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className={`px-3 py-1 rounded text-xs font-semibold border flex-shrink-0 ${getPriceInfo(restaurant.price).color}`}>
            {getPriceInfo(restaurant.price).label}
          </span>
          {restaurant.price > 0 && (
            <span className="text-sm text-purple-400 font-bold flex-shrink-0">{restaurant.price} Kč</span>
          )}
        </div>
      </div>
    </>
  );

  if (restaurant.website_url) {
    return (
      <a
        href={restaurant.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl shadow-purple-900/10 hover:shadow-purple-600/20 transition-all duration-500 p-6 border border-purple-600/20 hover:border-purple-500/40 group relative overflow-hidden cursor-pointer hover:scale-105"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl shadow-purple-900/10 transition-all duration-500 p-6 border border-purple-600/20 group relative overflow-hidden">
      <CardContent />
    </div>
  );
}
