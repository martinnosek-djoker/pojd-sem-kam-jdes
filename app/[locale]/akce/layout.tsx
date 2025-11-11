import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gastro akce a události v Praze",
  description: "Sledujte aktuální gastro akce, food festivaly a kulinarní události v Praze. Nejlepší tipy na gastronomické zážitky.",
  keywords: ["gastro akce Praha", "food festival Praha", "kulinarní události", "gastro festival", "večeře s degustací"],
  openGraph: {
    title: "Gastro akce a události | Pojď sem! Kam jdeš?",
    description: "Najděte nejlepší gastro akce a kulinarní události v Praze",
    url: "https://www.pojdsemkamjdes.cz/akce",
  },
};

export default function AkceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
