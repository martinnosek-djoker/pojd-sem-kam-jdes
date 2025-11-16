import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurace poblíž",
  description: "Objevte nejlepší restaurace ve vašem okolí v Praze. Použijte GPS lokaci a najděte skvělá místa na jídlo do 2 km od vaší polohy.",
  keywords: ["restaurace v okolí", "restaurace poblíž", "GPS restaurace", "restaurace blízko mě", "kde se najíst poblíž"],
  openGraph: {
    title: "Restaurace poblíž | Pojď sem! Kam jdeš?",
    description: "Najděte nejlepší restaurace ve vašem okolí pomocí GPS lokace",
    url: "https://www.pojdsemkamjdes.cz/pobliz",
  },
};

export default function PoblizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
