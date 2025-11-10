import type { Metadata } from "next";
import "./globals.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Pojď sem! Kam jdeš? | Nejlepší restaurace v Praze",
    template: "%s | Pojď sem! Kam jdeš?",
  },
  description: "Osobní doporučení nejlepších restaurací, kaváren a cukráren v Praze. Objevte skvělá místa na jídlo podle lokality, typu kuchyně nebo ve vašem okolí.",
  keywords: [
    "restaurace Praha",
    "nejlepší restaurace Praha",
    "kam na jídlo Praha",
    "restaurace v okolí",
    "doporučení restaurace",
    "kde se najíst Praha",
    "české restaurace",
    "světové kuchyně Praha",
    "italská restaurace Praha",
    "asijská restaurace Praha",
    "kavárny Praha",
    "cukrárny Praha",
  ],
  authors: [{ name: "Peču si život", url: "https://www.instagram.com/pecu_si_zivot/" }],
  creator: "Peču si život",
  publisher: "Pojď sem! Kam jdeš?",
  metadataBase: new URL("https://www.pojdsemkamjdes.cz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://www.pojdsemkamjdes.cz",
    siteName: "Pojď sem! Kam jdeš?",
    title: "Pojď sem! Kam jdeš? | Nejlepší restaurace v Praze",
    description: "Objevte nejlepší restaurace, kavárny a cukrárny v Praze. Osobní doporučení a tipy na skvělá místa.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pojď sem! Kam jdeš? - Restaurace v Praze",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pojď sem! Kam jdeš? | Nejlepší restaurace v Praze",
    description: "Objevte nejlepší restaurace, kavárny a cukrárny v Praze",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Přidáš později po registraci v Google Search Console
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">
        <HamburgerMenu />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
