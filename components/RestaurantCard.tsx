"use client";

import { Restaurant, Review } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { createReviewSlug } from "@/lib/slug";
import { useState } from "react";
import Link from "next/link";

interface RestaurantCardProps {
  restaurant: Restaurant;
  forceLocation?: string; // If provided, only show this location instead of all
  review?: Review; // If restaurant has a review, include it here
}

export default function RestaurantCard({ restaurant, forceLocation, review }: RestaurantCardProps) {
  const proxiedImageUrl = getProxiedImageUrl(restaurant.image_url, restaurant.name);
  const [imageError, setImageError] = useState(false);
  // Use review.restaurant.name to match the static paths generated for mobile builds
  const reviewSlug = review ? createReviewSlug(review.id, review.restaurant?.name || restaurant.name) : null;
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
      {proxiedImageUrl && !imageError ? (
        <div className="relative -m-6 mb-4 h-48 overflow-hidden rounded-t-lg">
          <img
            src={proxiedImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          {/* Review Badge */}
          {reviewSlug && (
            <Link
              href={`/recenze/${reviewSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 bg-green-600/90 hover:bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors z-10"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-white text-sm font-semibold">Recenze</span>
            </Link>
          )}
          {restaurant.website_url && (
            <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm rounded-full p-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div className="relative -m-6 mb-4 h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-purple-900/20 to-gray-900/40 flex items-center justify-center">
          <span className="text-6xl opacity-20">🍽️</span>
          {/* Review Badge */}
          {reviewSlug && (
            <Link
              href={`/recenze/${reviewSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 bg-green-600/90 hover:bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors z-10"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-white text-sm font-semibold">Recenze</span>
            </Link>
          )}
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

        <div className="flex items-center gap-2">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded border border-purple-700/30">
            {restaurant.cuisine_type}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-purple-900/30 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">{renderStars(restaurant.rating)}</div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded text-xs font-semibold border flex-shrink-0 ${getPriceInfo(restaurant.price).color}`}>
            {getPriceInfo(restaurant.price).label}
          </span>
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
