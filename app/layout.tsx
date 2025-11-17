import "./globals.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: {
    default: "TOP 10 podniků, o kterých se dnes mluví | Pojď sem! Kam jdeš? | Nejlepší restaurace v Praze",
    template: "%s | Pojď sem! Kam jdeš?",
  },
  description:
    "TOP 10 podniků, o kterých se dnes mluví v Praze! Objevte trendy restaurace, kavárny a cukrárny. Osobní doporučení nejlepších míst podle lokality, typu kuchyně nebo ve vašem okolí.",
  keywords: [
    "top 10 podniků o kterých se dnes mluví",
    "top 10 podniků praha",
    "trendy restaurace Praha",
    "nejlepší restaurace Praha",
    "kam na jídlo Praha",
    "trending restaurace",
    "oblíbené restaurace Praha",
    "nejžhavější restaurace",
    "restaurace v okolí",
    "doporučení restaurace",
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
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://www.pojdsemkamjdes.cz/",
    siteName: "Pojď sem! Kam jdeš?",
    title: "TOP 10 podniků, o kterých se dnes mluví | Pojď sem! Kam jdeš?",
    description:
      "Objevte TOP 10 podniků, o kterých se dnes mluví v Praze! Trendy restaurace, kavárny a cukrárny. Osobní doporučení nejlepších míst.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TOP 10 podniků Praha - Pojď sem! Kam jdeš?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOP 10 podniků, o kterých se dnes mluví | Pojď sem! Kam jdeš?",
    description: "Objevte trendy restaurace, kavárny a cukrárny v Praze. Nejžhavější tipy z pražské gastronomie.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
