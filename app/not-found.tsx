"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ReviewDetailPage from "./recenze/[slug]/ReviewDetail";
import { Review } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";
import { getReviewIdFromSlug } from "@/lib/slug";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  const pathname = usePathname();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReviewPage, setIsReviewPage] = useState(false);

  useEffect(() => {
    // Check if this is a review page that wasn't statically generated
    if (pathname && pathname.startsWith('/recenze/')) {
      setIsReviewPage(true);

      // Extract slug from pathname (remove leading /recenze/)
      const slug = pathname.replace('/recenze/', '').replace(/\/$/, '');

      if (slug) {
        // Try to load review from API
        async function loadReview() {
          try {
            const reviewId = getReviewIdFromSlug(slug);

            if (!reviewId) {
              setLoading(false);
              return;
            }

            const res = await fetch(getApiUrl(`/api/reviews/${reviewId}`));
            if (!res.ok) {
              setLoading(false);
              return;
            }

            const data = await res.json();
            setReview(data);
          } catch (error) {
            console.error('Error loading review:', error);
          } finally {
            setLoading(false);
          }
        }

        loadReview();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [pathname]);

  // If this is a review page and we found the review, show it
  if (isReviewPage && review) {
    return <ReviewDetailPage initialReview={review} />;
  }

  // If still loading review data, show loading
  if (isReviewPage && loading) {
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

  // Show 404 page
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="text-center px-8">
        <h1 className="text-6xl font-bold text-purple-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-6">
          Stránka nenalezena
        </h2>
        <p className="text-gray-400 mb-8">
          Omlouváme se, ale tato stránka neexistuje.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50"
        >
          Zpět na domovskou stránku
        </Link>
      </div>
    </main>
  );
}
