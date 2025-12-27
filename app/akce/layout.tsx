import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gastro akce v Praze | Adventní trhy, food festivaly a kulinářské události",
  description: "Aktuální gastro akce, adventní trhy, food festivaly a kulinářské události v Praze. Kompletní kalendář gastronomických akcí v Praze.",
  keywords: [
    "gastro akce Praha",
    "adventní trhy Praha",
    "food festival Praha",
    "kulinářské události Praha",
    "kalendář gastro akcí Praha",
    "kam na adventní trhy Praha",
    "food eventy Praha",
    "gastronomické akce Praha",
    "street food Praha",
    "farmářské trhy Praha",
    "degustace Praha",
    "wine festival Praha",
  ],
  openGraph: {
    title: "Gastro akce v Praze | Adventní trhy a food festivaly",
    description: "Aktuální gastro akce, adventní trhy, food festivaly a kulinářské události v Praze. Kompletní kalendář gastronomických akcí.",
    url: "https://www.pojdsemkamjdes.cz/akce",
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gastro akce v Praze | Adventní trhy a food festivaly",
    description: "Aktuální gastro akce, adventní trhy a kulinářské události v Praze",
  },
};

export default function AkceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
