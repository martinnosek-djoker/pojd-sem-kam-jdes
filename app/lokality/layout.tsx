import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurace podle lokalit",
  description: "Prozkoumejte nejlepší restaurace v Praze podle městských čtvrtí. Karlín, Vinohrady, Holešovice, Žižkov a další lokality s top doporučeními.",
  keywords: ["restaurace Karlín", "restaurace Vinohrady", "restaurace Holešovice", "restaurace Žižkov", "restaurace podle čtvrtí Praha"],
  openGraph: {
    title: "Restaurace podle lokalit | Pojď sem! Kam jdeš?",
    description: "Najděte nejlepší restaurace v jednotlivých pražských čtvrtích",
    url: "https://www.pojdsemkamjdes.cz/lokality",
  },
};

export default function LokalityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
