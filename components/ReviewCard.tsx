"use client";

import Link from "next/link";
import Image from "next/image";
import { Review } from "@/lib/types";
import { createReviewSlug } from "@/lib/slug";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  // Get first image or fallback
  const mainImage = review.images?.[0] || review.restaurant?.image_url;

  // Format date
  const visitDate = new Date(review.visit_date).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Extract plain text from content (remove HTML/markdown)
  const getPlainTextPreview = (content: string, maxLength: number = 150) => {
    // Remove markdown bold syntax
    let text = content.replace(/\*\*(.*?)\*\*/g, "$1");
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, "");
    // Trim and add ellipsis
    if (text.length > maxLength) {
      return text.substring(0, maxLength).trim() + "...";
    }
    return text;
  };

  // Create slug from review ID and restaurant name
  const reviewSlug = review.restaurant
    ? createReviewSlug(review.id, review.restaurant.name)
    : review.id.toString();

  return (
    <Link href={`/recenze/${reviewSlug}`}>
      <div className="group relative bg-gradient-to-br from-purple-900/20 via-gray-900/50 to-black border-2 border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-900/50">
        {/* Badge - Featured Review */}
        <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-purple-400 flex items-center gap-1.5">
          <span>✨</span>
          <span>Nová recenze</span>
        </div>

        {/* Image or Placeholder */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={review.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />
            </>
          ) : (
            // Gradient placeholder when no image
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-800 to-purple-900 flex items-center justify-center">
              <div className="text-center text-white/30">
                <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative p-6">
          {/* Restaurant name */}
          {review.restaurant && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-purple-400 text-sm font-semibold">
                {review.restaurant.name}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">
                {review.restaurant.location}
              </span>
            </div>
          )}

          {/* Review title */}
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {review.title}
          </h3>

          {/* Visit date */}
          <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Navštíveno {visitDate}</span>
          </div>

          {/* Content preview */}
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {getPlainTextPreview(review.content)}
          </p>

          {/* Photo count */}
          {review.images && review.images.length > 0 && (
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{review.images.length} {review.images.length === 1 ? "fotka" : review.images.length < 5 ? "fotky" : "fotek"}</span>
            </div>
          )}

          {/* Read more arrow */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
