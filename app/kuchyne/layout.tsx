import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Světové kuchyně",
  description: "Objevte nejlepší restaurace podle typu kuchyně v Praze. Italská, asijská, mexická, česká a další světové kuchyně na jednom místě.",
  keywords: ["italská restaurace Praha", "asijská restaurace Praha", "mexická restaurace Praha", "vietnamská restaurace", "japonská restaurace", "česká kuchyně"],
  openGraph: {
    title: "Světové kuchyně | Pojď sem! Kam jdeš?",
    description: "Najděte nejlepší restaurace podle typu kuchyně v Praze",
    url: "https://www.pojdsemkamjdes.cz/kuchyne",
  },
};

export default function KuchyneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
