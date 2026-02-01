"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Review, Restaurant } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";
import { getReviewIdFromSlug } from "@/lib/slug";

interface ReviewDetailPageProps {
  initialReview?: Review | null;
}

export default function ReviewDetailPage({ initialReview }: ReviewDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(initialReview || null);
  const [loading, setLoading] = useState(!initialReview);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>([]);
  const [showAllDishes, setShowAllDishes] = useState(false);

  useEffect(() => {
    // If we already have initial review data, skip API fetch
    if (initialReview) {
      setLoading(false);
      return;
    }

    async function fetchReview() {
      try {
        // Extract review ID from slug
        const slug = params.slug as string;
        const reviewId = getReviewIdFromSlug(slug);

        if (!reviewId) {
          throw new Error("Invalid review slug");
        }

        const res = await fetch(getApiUrl(`/api/reviews/${reviewId}`));
        if (!res.ok) {
          throw new Error("Review not found");
        }
        const data = await res.json();
        setReview(data);

        // Fetch similar restaurants if they exist
        if (data.similar_restaurant_ids && data.similar_restaurant_ids.length > 0) {
          const restaurantsRes = await fetch(getApiUrl("/api/restaurants"));
          const allRestaurants = await restaurantsRes.json();
          const similar = allRestaurants.filter((r: Restaurant) =>
            data.similar_restaurant_ids.includes(r.id)
          );
          setSimilarRestaurants(similar);
        }
      } catch (error) {
        console.error("Error fetching review:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchReview();
    }
  }, [params.slug, router, initialReview]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 sm:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Logo />
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-800 rounded-lg" />
            <div className="h-8 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded" />
              <div className="h-4 bg-gray-800 rounded" />
              <div className="h-4 bg-gray-800 rounded w-5/6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!review) {
    return null;
  }

  const visitDate = new Date(review.visit_date).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const allImages = review.images || [];
  const currentImage = allImages[selectedImage] || review.restaurant?.image_url || "/placeholder-restaurant.jpg";

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 sm:px-8 py-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Zpět na homepage</span>
          </Link>
        </div>

        {/* Restaurant Header */}
        {review.restaurant && (
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                  {review.restaurant.name}
                </h1>
                <div className="flex items-center gap-3 text-lg text-gray-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{review.restaurant.location}</span>
                  </div>
                  {review.restaurant.cuisine_type && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span>{review.restaurant.cuisine_type}</span>
                    </>
                  )}
                </div>
              </div>
              {review.restaurant.website_url && (
                <a
                  href={review.restaurant.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <span>Navštívit web</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Main Image Gallery */}
        {allImages.length > 0 && (
          <div className="mb-8">
            <div className="relative h-[500px] md:h-[650px] rounded-xl overflow-hidden mb-4">
              <Image
                src={currentImage}
                alt={review.title}
                fill
                className="object-contain bg-gray-900"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>

            {/* Image thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-purple-500 scale-95"
                        : "border-gray-700 hover:border-purple-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${review.title} - foto ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Content */}
        <article className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 sm:p-8">
          {/* Visit date */}
          <div className="flex items-center gap-2 mb-6 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Navštíveno {visitDate}</span>
          </div>

          {/* Ratings and Dishes Header */}
          {((review.overall_rating || review.total_spent || review.rating_interior || review.rating_service || review.rating_food) ||
            (review.dishes && review.dishes.length > 0)) && (
            <div className="mb-8 bg-gradient-to-br from-purple-900/30 to-gray-800/30 border border-purple-500/40 rounded-xl p-6">

              {/* Overall Rating and Total Spent - Highlight */}
              {(review.overall_rating || review.total_spent) && (
                <div className="mb-6 pb-6 border-b border-purple-500/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {review.overall_rating && (
                      <div className="bg-purple-600/20 border-2 border-purple-500/50 rounded-xl p-6 text-center">
                        <div className="text-sm text-purple-300 mb-2 font-semibold uppercase tracking-wide">Celkové hodnocení</div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-6xl font-bold text-purple-400">{review.overall_rating}</span>
                          <div className="text-left">
                            <div className="text-2xl text-gray-400">/10</div>
                            <div className="text-yellow-400 text-2xl">⭐</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {review.total_spent && (
                      <div className="bg-purple-600/20 border-2 border-purple-500/50 rounded-xl p-6 text-center">
                        <div className="text-sm text-purple-300 mb-2 font-semibold uppercase tracking-wide">Celková útrata</div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-6xl font-bold text-purple-400">{review.total_spent.toLocaleString('cs-CZ')}</span>
                          <div className="text-2xl text-gray-400">Kč</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Ratings */}
              {(review.rating_interior || review.rating_service || review.rating_food) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>Detailní hodnocení</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {review.rating_interior && (
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-sm text-gray-400 mb-1">Interiér</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-purple-400">{review.rating_interior}</span>
                          <span className="text-gray-500">/10</span>
                        </div>
                      </div>
                    )}
                    {review.rating_service && (
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-sm text-gray-400 mb-1">Obsluha</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-purple-400">{review.rating_service}</span>
                          <span className="text-gray-500">/10</span>
                        </div>
                      </div>
                    )}
                    {review.rating_food && (
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-sm text-gray-400 mb-1">Jídlo</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-purple-400">{review.rating_food}</span>
                          <span className="text-gray-500">/10</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dishes */}
              {review.dishes && review.dishes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <span>🍽️</span>
                    <span>Co jsem měl</span>
                  </h3>
                  <div className="space-y-2">
                    {(showAllDishes ? review.dishes : review.dishes.slice(0, 3)).map((dish, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg"
                      >
                        <div className="flex items-baseline gap-1 min-w-[60px]">
                          <span className="text-3xl font-bold text-purple-400">{dish.rating}</span>
                          <span className="text-gray-500">/10</span>
                        </div>
                        <span className="text-purple-300 font-medium text-lg">{dish.name}</span>
                      </div>
                    ))}
                  </div>
                  {review.dishes.length > 3 && (
                    <button
                      onClick={() => setShowAllDishes(!showAllDishes)}
                      className="mt-3 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      {showAllDishes ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span>Zobrazit méně</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span>Zobrazit všechna jídla ({review.dishes.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Review content */}
          <div
            className="prose prose-invert prose-purple max-w-none text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: review.content }}
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.8"
            }}
          />

          {/* Author signature */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <div>
                <p className="text-white font-semibold">Peču si život</p>
                <a
                  href="https://www.instagram.com/pecu_si_zivot/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  @pecu_si_zivot
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Similar Restaurants */}
        {similarRestaurants.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Podobné restaurace
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarRestaurants
                .sort((a, b) => a.name.localeCompare(b.name, 'cs'))
                .map((restaurant) => (
                <a
                  key={restaurant.id}
                  href={restaurant.website_url || `/?restaurant=${restaurant.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-900/50 border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-500/60 transition-all hover:scale-[1.02]"
                >
                  {/* Restaurant Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-800">
                    {restaurant.image_url ? (
                      <Image
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-800 to-purple-900">
                        <svg className="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{restaurant.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{restaurant.cuisine_type}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-white font-semibold">{restaurant.rating}/10</span>
                        </div>
                        <div className="text-purple-400 font-semibold">
                          {restaurant.price} Kč
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
