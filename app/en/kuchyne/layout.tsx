import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Cuisines",
  description: "Discover the best restaurants in Prague by cuisine type. Italian, Asian, Mexican, Czech and other world cuisines in one place.",
  keywords: ["Italian restaurant Prague", "Asian restaurant Prague", "Mexican restaurant Prague", "Vietnamese restaurant Prague", "Japanese restaurant Prague", "Czech cuisine"],
  alternates: {
    canonical: "/en/kuchyne",
    languages: {
      cs: "/kuchyne",
      en: "/en/kuchyne",
    },
  },
  openGraph: {
    title: "World Cuisines | Pojď sem! Kam jdeš?",
    description: "Find the best restaurants in Prague by cuisine type",
    url: "https://www.pojdsemkamjdes.cz/en/kuchyne",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cuisines",
    description: "Find the best restaurants in Prague by cuisine type",
  },
};

export default function EnglishKuchyneLayout({ children }: { children: React.ReactNode }) {
  return children;
}
