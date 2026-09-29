import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurants Nearby",
  description: "Discover the best restaurants near you in Prague. Use GPS location to find great places to eat within 2 km of your position.",
  keywords: ["restaurants nearby", "GPS restaurants Prague", "restaurants near me Prague", "where to eat nearby Prague"],
  alternates: {
    canonical: "/en/pobliz",
    languages: {
      cs: "/pobliz",
      en: "/en/pobliz",
    },
  },
  openGraph: {
    title: "Restaurants Nearby | Pojď sem! Kam jdeš?",
    description: "Find the best restaurants near you using GPS location",
    url: "https://www.pojdsemkamjdes.cz/en/pobliz",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurants Nearby",
    description: "Find the best restaurants near you using GPS location",
  },
};

export default function EnglishPoblizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
