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
        {halfStar && (
          <span className="relative inline-block text-lg" style={{ width: '1.125rem' }}>
            <span className="text-gray-700">★</span>
            <span className="absolute top-0 left-0 text-purple-400 overflow-hidden" style={{ width: '50%' }}>
              ★
            </span>
          </span>
        )}
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
      {/* Image Header */}
      {restaurant.image_url ? (
        <div className="relative -m-6 mb-4 h-48 overflow-hidden rounded-t-lg">
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          {restaurant.website_url && (
            <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm rounded-full p-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div className="relative -m-6 mb-4 h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-purple-900/20 to-gray-900/40 flex items-center justify-center">
          <span className="text-6xl opacity-20">🍽️</span>
          {restaurant.website_url && (
            <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm rounded-full p-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-purple-600/30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-purple-700/20 pointer-events-none"></div>

      <div className="mb-4 relative">
        <h3 className="text-xl font-bold text-purple-300 mb-1 tracking-wide group-hover:text-purple-200 transition-colors">
          {restaurant.name}
        </h3>
      </div>

      <div className="space-y-3 mb-5">
        {/* Location - clickable if address is available */}
        {restaurant.address ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors group/location w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm">📍</span>
            <span className="text-sm tracking-wide border-b border-transparent group-hover/location:border-purple-400 transition-colors">
              {restaurant.location}
            </span>
            <svg className="w-3 h-3 opacity-0 group-hover/location:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-sm">📍</span>
            <span className="text-sm tracking-wide">{restaurant.location}</span>
          </div>
        )}

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
