import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cafes in Prague",
  description: "Discover the best cafes in Prague. Specialty coffee, cozy atmosphere, and great spots to work or meet friends.",
  keywords: ["cafe Prague", "specialty coffee Prague", "best coffee Prague", "where to get coffee Prague", "cafe with wifi"],
  alternates: {
    canonical: "/en/kavarny",
    languages: {
      cs: "/kavarny",
      en: "/en/kavarny",
    },
  },
  openGraph: {
    title: "Cafes in Prague | Pojď sem! Kam jdeš?",
    description: "Discover the best cafes in Prague",
    url: "https://www.pojdsemkamjdes.cz/en/kavarny",
    locale: "en_US",
  },
};

export default function EnglishKavarnyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
