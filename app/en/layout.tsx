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
