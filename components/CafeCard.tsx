"use client";

import { Cafe, Review } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { createReviewSlug } from "@/lib/slug";
import { useState } from "react";
import Link from "next/link";

interface CafeCardProps {
  cafe: Cafe;
  forceLocation?: string; // If provided, only show this location instead of all
  review?: Review; // If cafe has a review, include it here
}

export default function CafeCard({ cafe, forceLocation, review }: CafeCardProps) {
  const proxiedImageUrl = getProxiedImageUrl(cafe.image_url, cafe.name, 'cafes');
  const [imageError, setImageError] = useState(false);
  // Use review.cafe.name to match the static paths generated for mobile builds
  const reviewSlug = review ? createReviewSlug(review.id, review.cafe?.name || cafe.name) : null;

  // Check if review is new (within 14 days of visit date)
  const isNewReview = review ? (() => {
    const visitDateObj = new Date(review.visit_date);
    const diffMs = Date.now() - visitDateObj.getTime();
    return diffMs / (1000 * 60 * 60 * 24) <= 14;
  })() : false;

  const CardContent = () => (
    <>
      {/* Image Header */}
      {proxiedImageUrl && !imageError ? (
        <div className="relative -m-6 mb-4 h-48 overflow-hidden rounded-t-lg">
          <img
            src={proxiedImageUrl}
            alt={cafe.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          {/* Review Badge */}
          {reviewSlug && (
            <Link
              href={`/recenze/${reviewSlug}`}
              className={`absolute top-3 left-3 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors z-10 ${
                isNewReview
                  ? 'bg-purple-600/90 hover:bg-purple-500/90 border-2 border-purple-400'
                  : 'bg-green-600/90 hover:bg-green-500/90'
              }`}
            >
              {isNewReview ? (
                <>
                  <span className="text-white">✨</span>
                  <span className="text-white text-sm font-bold">Nová recenze</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-white text-sm font-semibold">Recenze</span>
                </>
              )}
            </Link>
          )}
          {cafe.website_url && (
            <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm rounded-full p-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div className="relative -m-6 mb-4 h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-purple-900/20 to-gray-900/40 flex items-center justify-center">
          <span className="text-6xl opacity-20">☕</span>
          {/* Review Badge */}
          {reviewSlug && (
            <Link
              href={`/recenze/${reviewSlug}`}
              className={`absolute top-3 left-3 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 transition-colors z-10 ${
                isNewReview
                  ? 'bg-purple-600/90 hover:bg-purple-500/90 border-2 border-purple-400'
                  : 'bg-green-600/90 hover:bg-green-500/90'
              }`}
            >
              {isNewReview ? (
                <>
                  <span className="text-white">✨</span>
                  <span className="text-white text-sm font-bold">Nová recenze</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-white text-sm font-semibold">Recenze</span>
                </>
              )}
            </Link>
          )}
          {cafe.website_url && (
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
          {cafe.name}
        </h3>
        {/* Tags */}
        {cafe.tags && cafe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {cafe.tags.map((tag, idx) => {
              const tagColors = {
                'dezert': 'bg-orange-600/20 text-orange-300 border-orange-500/30',
                'matcha': 'bg-green-500/20 text-green-300 border-green-500/30',
                'snídaně': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
              };
              const colorClass = tagColors[tag as keyof typeof tagColors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 text-xs font-semibold rounded border ${colorClass}`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}
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
                : cafe.location.split(',').map(l => l.trim());

              // Helper function to find address - case insensitive and flexible
              const findAddress = (location: string): string | null => {
                if (!cafe.addresses) return null;

                // Try exact match first
                if (cafe.addresses[location]) {
                  return cafe.addresses[location];
                }

                // Try case-insensitive match
                const lowerLocation = location.toLowerCase();
                const matchingKey = Object.keys(cafe.addresses).find(
                  key => key.toLowerCase() === lowerLocation
                );

                if (matchingKey) {
                  return cafe.addresses[matchingKey];
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
                  // Include cafe name with address for better Google Maps results
                  const searchQuery = `${cafe.name}, ${address}`;
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
      </div>
    </>
  );

  if (cafe.website_url) {
    return (
      <a
        href={cafe.website_url}
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
