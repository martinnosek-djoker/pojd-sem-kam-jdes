import { Metadata } from "next";
import SetHtmlLang from "@/components/SetHtmlLang";

export const metadata: Metadata = {
  title: {
    default: "Best restaurants, cafes and bakeries in Prague",
    template: "%s | Pojď sem! Kam jdeš?",
  },
  description:
    "Personal recommendations for the best restaurants, cafes and bakeries in Prague from @Peču si život. Search by location, cuisine, or distance.",
  alternates: {
    canonical: "/en",
    languages: {
      cs: "/",
      en: "/en",
    },
  },
  openGraph: {
    locale: "en_US",
    url: "https://www.pojdsemkamjdes.cz/en",
    title: "Best restaurants, cafes and bakeries in Prague | Personal recommendations",
    description:
      "Discover the best food spots in Prague with personal recommendations from @Peču si život. Filter by location, cuisine type, or find a place near you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best restaurants, cafes and bakeries in Prague",
    description:
      "Personal recommendations for the best food spots in Prague from @Peču si život. Filter by location, cuisine type, or distance.",
    images: ["/og-image.jpg"],
  },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SetHtmlLang lang="en" />
      {children}
    </>
  );
}
