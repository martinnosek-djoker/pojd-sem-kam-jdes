import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Michelin 2026 v Praze",
  description: "Objevte Michelinské restaurace v Praze 2026. Hvězdičkové restaurace a Bib Gourmand oceněná místa.",
  keywords: ["Michelin Praha", "hvězdičková restaurace Praha", "Bib Gourmand Praha", "Michelin guide Praha", "fine dining Praha"],
  openGraph: {
    title: "Michelin 2026 v Praze | Pojď sem! Kam jdeš?",
    description: "Najděte Michelinské restaurace v Praze",
    url: "https://www.pojdsemkamjdes.cz/michelin",
  },
};

export default function MichelinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
