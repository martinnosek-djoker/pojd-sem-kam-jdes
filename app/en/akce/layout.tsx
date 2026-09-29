import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Events in Prague",
  description: "Current food events, Christmas markets, food festivals and culinary happenings in Prague. The full calendar of Prague's food events.",
  keywords: [
    "food events Prague",
    "Christmas markets Prague",
    "food festival Prague",
    "culinary events Prague",
    "street food Prague",
    "farmers market Prague",
    "tasting Prague",
    "wine festival Prague",
  ],
  alternates: {
    canonical: "/en/akce",
    languages: {
      cs: "/akce",
      en: "/en/akce",
    },
  },
  openGraph: {
    title: "Food Events in Prague | Christmas Markets & Food Festivals",
    description: "Current food events, Christmas markets, food festivals and culinary happenings in Prague.",
    url: "https://www.pojdsemkamjdes.cz/en/akce",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Events in Prague | Christmas Markets & Food Festivals",
    description: "Current food events, Christmas markets and culinary happenings in Prague",
  },
};

export default function EnglishAkceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
