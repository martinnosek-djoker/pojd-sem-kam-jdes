"use client";

import { MichelinRestaurant, MICHELIN_AWARD_LABELS } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { useState } from "react";

interface MichelinCardProps {
  restaurant: MichelinRestaurant;
  forceLocation?: string;
}

export default function MichelinCard({ restaurant, forceLocation }: MichelinCardProps) {
  const proxiedImageUrl = getProxiedImageUrl(restaurant.image_url);
  const [imageError, setImageError] = useState(false);

  const getAwardColor = (awardType: string) => {
    switch (awardType) {
      case "2-stars":
        return "bg-gradient-to-r from-yellow-600 to-yellow-500";
      case "1-star":
        return "bg-gradient-to-r from-yellow-500 to-yellow-400";
      case "bib-gourmand":
        return "bg-gradient-to-r from-red-600 to-red-500";
      default:
        return "bg-purple-600";
    }
  };

  const CardContent = () => (
    <>
      {/* Image Header */}
      {proxiedImageUrl && !imageError ? (
        <div className="relative -m-6 mb-4 h-48 overflow-hidden rounded-t-lg">
          <img
            src={proxiedImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          {restaurant.website_url && (
            <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm rounded-full p-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
          {/* Award badge on image */}
          <div className={`absolute top-3 left-3 ${getAwardColor(restaurant.award_type)} px-3 py-1.5 rounded-lg shadow-lg`}>
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {MICHELIN_AWARD_LABELS[restaurant.award_type]}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative -m-6 mb-4 h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-purple-900/20 to-gray-900/40 flex items-center justify-center">
          <span className="text-6xl opacity-20">⭐</span>
          {restaurant.website_url && (
            <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm rounded-full p-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
          {/* Award badge on placeholder */}
          <div className={`absolute top-3 left-3 ${getAwardColor(restaurant.award_type)} px-3 py-1.5 rounded-lg shadow-lg`}>
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {MICHELIN_AWARD_LABELS[restaurant.award_type]}
            </span>
          </div>
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
        {/* Locations - group by address for same location */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-gray-400">📍</span>
          <div className="text-sm text-gray-300">
            {(() => {
              // If forceLocation is provided, only show that location
              const locations = forceLocation
                ? [forceLocation]
                : restaurant.location.split(',').map(l => l.trim());

              // Helper function to find address - case insensitive and flexible
              const findAddress = (location: string): string | null => {
                if (!restaurant.addresses) return null;

                // Try exact match first
                if (restaurant.addresses[location]) {
                  return restaurant.addresses[location];
                }

                // Try case-insensitive match
                const lowerLocation = location.toLowerCase();
                const matchingKey = Object.keys(restaurant.addresses).find(
                  key => key.toLowerCase() === lowerLocation
                );

                if (matchingKey) {
                  return restaurant.addresses[matchingKey];
                }

                return null;
              };

              // Group locations by address
              const addressGroups = new Map<string | null, string[]>();
              locations.forEach(location => {
                const address = findAddress(location);
                const existing = addressGroups.get(address) || [];
                addressGroups.set(address, [...existing, location]);
              });

              // Render grouped locations
              const groups = Array.from(addressGroups.entries());
              return groups.map(([address, locs], groupIdx) => {
                const isLastGroup = groupIdx === groups.length - 1;
                const locationText = locs.join(', ');

                if (address) {
                  // Include restaurant name with address for better Google Maps results
                  const searchQuery = `${restaurant.name}, ${address}`;
                  return (
                    <span key={groupIdx}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-purple-300 hover:text-purple-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {locationText}
                      </a>
                      {!isLastGroup && ', '}
                    </span>
                  );
                }

                return (
                  <span key={groupIdx} className="text-gray-400">
                    {locationText}{!isLastGroup && ', '}
                  </span>
                );
              });
            })()}
          </div>
        </div>

        {/* Cuisine type */}
        {restaurant.cuisine_type && (
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded border border-purple-700/30">
              {restaurant.cuisine_type}
            </span>
          </div>
        )}

        {/* Description */}
        {restaurant.description && (
          <div className="text-sm text-gray-400 italic">
            {restaurant.description}
          </div>
        )}
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
