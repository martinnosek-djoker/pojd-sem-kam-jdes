import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gastro akce a události v Praze - Kalendář food festivalů 2025/2026",
  description: "Přehled aktuálních gastro akcí, food festivalů a kulinarních událostí v Praze. Nova Festival Chutí, Prague Ice Cream Festival, Makro Czech Gastro Fest a další. Jediný kompletní kalendář gastronomických akcí!",
  keywords: [
    "gastro akce Praha",
    "food festival Praha",
    "kulinarní události Praha",
    "gastro festival 2025",
    "gastro festival 2026",
    "Nova Festival Chutí",
    "Prague Ice Cream Festival",
    "Makro Czech Gastro Fest",
    "gastro kalendář Praha",
    "food events Praha",
    "kulinarní festival",
    "gastronomické akce",
    "degustační večeře Praha",
    "street food festival",
    "gastro Sweet Fest",
    "kalendář akcí Praha",
  ],
  openGraph: {
    title: "Gastro akce a události v Praze | Pojď sem! Kam jdeš?",
    description: "Kompletní přehled gastro akcí a food festivalů v Praze. Nova Festival Chutí, Ice Cream Festival, Gastro Fest a další. Nechte si ujít žádnou akci!",
    url: "https://www.pojdsemkamjdes.cz/akce",
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gastro akce Praha - Kalendář food festivalů",
    description: "Sledujte aktuální gastro akce a kulinarní festivaly v Praze. Váš kompletní průvodce gastronomickými událostmi!",
  },
  alternates: {
    canonical: "https://www.pojdsemkamjdes.cz/akce",
  },
};

export default function AkceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
