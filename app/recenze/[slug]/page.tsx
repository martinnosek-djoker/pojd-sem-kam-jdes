import ReviewDetailPage from "./ReviewDetail";
import { readFileSync } from "fs";
import { join } from "path";
import { createReviewSlug } from "@/lib/slug";

// Allow dynamic params for client-side routing in mobile app
export const dynamicParams = true;

// For static export, generate paths from cached reviews data
export async function generateStaticParams() {
  // For mobile build, try to read from cache file
  if (process.env.MOBILE_BUILD) {
    try {
      const cacheFile = join(process.cwd(), '.reviews-cache.json');
      const reviews = JSON.parse(readFileSync(cacheFile, 'utf-8'));

      return reviews.map((review: any) => ({
        slug: createReviewSlug(review.id, review.restaurant?.name || "review"),
      }));
    } catch (error) {
      console.log('Could not read reviews cache, returning empty array');
      return [];
    }
  }

  return [];
}

// Load review data at build time for static export
function getReviewDataForSlug(slug: string) {
  if (process.env.MOBILE_BUILD) {
    try {
      const cacheFile = join(process.cwd(), '.reviews-cache.json');
      const reviews = JSON.parse(readFileSync(cacheFile, 'utf-8'));

      // Extract ID from slug (format: "id-restaurant-name")
      const reviewId = parseInt(slug.split('-')[0]);
      const review = reviews.find((r: any) => r.id === reviewId);

      return review || null;
    } catch (error) {
      console.log('Could not read review data:', error);
      return null;
    }
  }

  return null;
}

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const reviewData = getReviewDataForSlug(params.slug);
  return <ReviewDetailPage initialReview={reviewData} />;
}
