import { Metadata } from "next";
import { getApiUrl } from "@/lib/api-config";
import { getReviewIdFromSlug } from "@/lib/slug";
import { readFileSync } from "fs";
import { join } from "path";

// Helper function to get review data from cache or API
async function getReviewData(reviewId: number) {
  // For mobile build, read from cache file
  if (process.env.MOBILE_BUILD) {
    try {
      const cacheFile = join(process.cwd(), '.reviews-cache.json');
      const reviews = JSON.parse(readFileSync(cacheFile, 'utf-8'));
      return reviews.find((r: any) => r.id === reviewId) || null;
    } catch (error) {
      console.error("Error reading review from cache:", error);
      return null;
    }
  }

  // For web build, fetch from API
  try {
    const res = await fetch(getApiUrl(`/api/reviews/${reviewId}`), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching review:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const reviewId = getReviewIdFromSlug(params.slug);
    if (!reviewId) {
      return {
        title: "Recenze nenalezena | Gastro Tips",
      };
    }

    const review = await getReviewData(reviewId);

    if (!review) {
      return {
        title: "Recenze nenalezena | Gastro Tips",
      };
    }
    const restaurantName = review.restaurant?.name || review.cafe?.name || "Místo";
    const visitDate = new Date(review.visit_date).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
    });

    // Extract plain text from HTML content for description
    const plainText = review.content
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .substring(0, 160);

    const description = `Recenze restaurace ${restaurantName} - ${visitDate}. ${plainText}...`;

    return {
      title: `${restaurantName} - Recenze | Gastro Tips`,
      description,
      openGraph: {
        title: `${restaurantName} - Recenze`,
        description,
        type: "article",
        publishedTime: review.created_at,
        modifiedTime: review.updated_at,
        authors: ["Peču si život"],
        images: review.images?.[0]
          ? [
              {
                url: review.images[0],
                width: 1200,
                height: 630,
                alt: `${restaurantName} - fotografie`,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${restaurantName} - Recenze`,
        description,
        images: review.images?.[0] ? [review.images[0]] : [],
      },
      keywords: [
        restaurantName,
        review.restaurant?.location,
        review.restaurant?.cuisine_type,
        "recenze",
        "restaurace Praha",
        "gastro tipy",
        "kde jíst v Praze",
      ].filter(Boolean),
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Recenze | Gastro Tips",
    };
  }
}

async function getReviewStructuredData(slug: string) {
  try {
    const reviewId = getReviewIdFromSlug(slug);
    if (!reviewId) return null;

    const review = await getReviewData(reviewId);
    if (!review) return null;
    const place = review.restaurant || review.cafe;
    const placeName = place?.name || "Místo";
    const baseUrl = "https://www.pojdsemkamjdes.cz";

    // Extract plain text from HTML content
    const reviewText = review.content
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .substring(0, 500);

    return {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": review.cafe ? "CafeOrCoffeeShop" : "Restaurant",
        "name": placeName,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": place?.location || "Praha",
          "addressCountry": "CZ",
        },
        "servesCuisine": review.restaurant?.cuisine_type,
        "url": place?.website_url,
        "image": review.images?.[0] || place?.image_url,
      },
      "reviewRating": review.overall_rating
        ? {
            "@type": "Rating",
            "ratingValue": review.overall_rating,
            "bestRating": 10,
            "worstRating": 0,
          }
        : undefined,
      "author": {
        "@type": "Person",
        "name": "Peču si život",
        "url": "https://www.instagram.com/pecu_si_zivot/",
      },
      "datePublished": review.created_at,
      "dateModified": review.updated_at,
      "reviewBody": reviewText,
      "publisher": {
        "@type": "Organization",
        "name": "Pojď sem! Kam jdeš?",
        "url": baseUrl,
      },
    };
  } catch (error) {
    console.error("Error generating structured data:", error);
    return null;
  }
}

export default async function ReviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const structuredData = await getReviewStructuredData(params.slug);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  );
}
