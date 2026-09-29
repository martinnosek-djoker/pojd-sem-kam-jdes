import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurants by Location",
  description: "Explore the best restaurants in Prague by neighborhood. Karlín, Vinohrady, Holešovice, Žižkov and more, with top recommendations.",
  keywords: ["restaurants Karlín", "restaurants Vinohrady", "restaurants Holešovice", "restaurants Žižkov", "Prague restaurants by neighborhood"],
  alternates: {
    canonical: "/en/lokality",
    languages: {
      cs: "/lokality",
      en: "/en/lokality",
    },
  },
  openGraph: {
    title: "Restaurants by Location | Pojď sem! Kam jdeš?",
    description: "Find the best restaurants in each Prague neighborhood",
    url: "https://www.pojdsemkamjdes.cz/en/lokality",
    locale: "en_US",
  },
};

export default function EnglishLokalityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
