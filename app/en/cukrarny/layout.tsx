import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bakeries in Prague",
  description: "Discover the best bakeries in Prague. Traditional pastries, artisan bread, custom cakes and sweet treats.",
  keywords: ["bakery Prague", "pastry Prague", "cakes Prague", "croissants Prague", "desserts Prague"],
  alternates: {
    canonical: "/en/cukrarny",
    languages: {
      cs: "/cukrarny",
      en: "/en/cukrarny",
    },
  },
  openGraph: {
    title: "Bakeries in Prague | Pojď sem! Kam jdeš?",
    description: "Find the best bakeries in Prague",
    url: "https://www.pojdsemkamjdes.cz/en/cukrarny",
    locale: "en_US",
  },
};

export default function EnglishCukrarnyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
