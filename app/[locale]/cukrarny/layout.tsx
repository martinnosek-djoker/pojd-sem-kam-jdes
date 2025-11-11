import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cukrárny a pekárny v Praze",
  description: "Objevte nejlepší cukrárny a pekárny v Praze. Tradiční zákusky, řemeslné pečivo, dorty na míru a sladké pochoutky.",
  keywords: ["cukrárna Praha", "pekárna Praha", "dorty Praha", "zákusky Praha", "croissanty Praha", "dezerty Praha"],
  openGraph: {
    title: "Cukrárny a pekárny v Praze | Pojď sem! Kam jdeš?",
    description: "Najděte nejlepší cukrárny a pekárny v Praze",
    url: "https://www.pojdsemkamjdes.cz/cukrarny",
  },
};

export default function CukrarnyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
