import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vánoce 2025 v Praze | Kde koupit cukroví, vánočku a dárky",
  description: "Kde koupit nejlepší vánoční cukroví, vánočku a jedlé dárky v Praze? Tipy na kuchařky, zážitky a vánoční nákupy pro rok 2025. Objevte to nejlepší z pražských cukráren a pekáren.",
  keywords: [
    "kde koupit cukroví Praha",
    "kde koupit vánočku Praha",
    "vánoční cukroví Praha 2025",
    "nejlepší vánočka Praha",
    "vánoční dárky Praha",
    "jedlé dárky Praha",
    "vánoční nákupy Praha",
    "kam na cukroví Praha",
    "kde koupit vánoční cukroví",
    "pražské cukrárny vánoce",
    "vánoční pečivo Praha",
    "kuchařky dárky Praha",
    "gastronomické dárky Praha",
    "vánoční tipy Praha",
  ],
  openGraph: {
    title: "Vánoce 2025 v Praze | Kde koupit cukroví, vánočku a dárky",
    description: "Kde koupit nejlepší vánoční cukroví, vánočku a jedlé dárky v Praze? Tipy na kuchařky a vánoční nákupy pro rok 2025.",
    url: "https://www.pojdsemkamjdes.cz/vanoce",
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vánoce 2025 v Praze | Kde koupit cukroví, vánočku a dárky",
    description: "Tipy na nejlepší vánoční cukroví, vánočku a jedlé dárky v Praze",
  },
};

export default function VanoceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
