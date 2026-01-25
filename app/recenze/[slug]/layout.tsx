import { Metadata } from "next";
import { getApiUrl } from "@/lib/api-config";
import { getReviewIdFromSlug } from "@/lib/slug";

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

    const res = await fetch(getApiUrl(`/api/reviews/${reviewId}`), {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!res.ok) {
      return {
        title: "Recenze nenalezena | Gastro Tips",
      };
    }

    const review = await res.json();
    const restaurantName = review.restaurant?.name || "Restaurace";
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

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
