import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kavárny v Praze",
  description: "Objevte nejlepší kavárny v Praze. Specialitní káva, útulná atmosféra a skvělé místo na práci nebo setkání s přáteli.",
  keywords: ["kavárna Praha", "specialitní káva", "nejlepší káva Praha", "kde na kávu Praha", "kavárna s wifi"],
  openGraph: {
    title: "Kavárny v Praze | Pojď sem! Kam jdeš?",
    description: "Najděte nejlepší kavárny v Praze",
    url: "https://www.pojdsemkamjdes.cz/kavarny",
  },
};

export default function KavarnyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
