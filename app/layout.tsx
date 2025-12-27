import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";
import PushNotificationHandler from "@/components/PushNotificationHandler";
import ScrollToTop from "@/components/ScrollToTop";
import StructuredData from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: {
    default: "TOP 10 trendů | Pojď sem! Kam jdeš? | Nejlepší restaurace, kavárny a cukrárny v Praze",
    template: "%s | Pojď sem! Kam jdeš?",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover', // For iOS notch support
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pojď sem! Kam jdeš?',
  },
  themeColor: '#9333EA', // Purple color to match your brand
  description:
    "TOP 10 trendů v Praze! Objevte nejlepší restaurace, kavárny a cukrárny v Praze. Databáze podniků podle lokalit, typů kuchyně. Gastro akce a food festivaly v Praze.",
  keywords: [
    // Core Prague restaurant keywords
    "top 10 podniků praha",
    "nejlepší restaurace Praha",
    "trendy restaurace Praha",
    "kam na jídlo Praha",
    "restaurace Praha",
    "doporučení restaurace Praha",
    "oblíbené restaurace Praha",
    "top restaurace Praha",

    // Location-based Prague keywords
    "restaurace podle lokality Praha",
    "restaurace Vinohrady",
    "restaurace Holešovice",
    "restaurace centrum Praha",
    "restaurace v okolí Praha",

    // Cuisine types in Prague
    "světové kuchyně Praha",
    "italská restaurace Praha",
    "asijská restaurace Praha",
    "vietnamská restaurace Praha",
    "indická restaurace Praha",
    "české restaurace Praha",

    // Prague cafes & bakeries - unique offering!
    "nejlepší kavárny Praha",
    "kavárny v Praze",
    "káva Praha",
    "specialty coffee Praha",
    "nejlepší cukrárny Praha",
    "cukrárny v Praze",
    "kam na dort Praha",

    // Events & festivals in Prague
    "gastro akce Praha",
    "food festival Praha",
    "kulináře události Praha",
    "kalendář gastro akcí Praha",
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
    title: "TOP 10 trendů v Praze | Nejlepší restaurace, kavárny a cukrárny Praha",
    description:
      "TOP 10 trendů v Praze! Kompletní databáze nejlepších restaurací, kaváren a cukráren v Praze. Vyhledávání podle lokality a typu kuchyně. Gastro akce a food festivaly.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TOP 10 trendů Praha - Nejlepší restaurace, kavárny a cukrárny",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOP 10 trendů v Praze | Restaurace, kavárny a cukrárny",
    description: "Kompletní databáze nejlepších restaurací, kaváren a cukráren v Praze. Vyhledávání podle lokality a typu kuchyně.",
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
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="antialiased pb-20 pt-14 bg-black">
        <StructuredData />
        <ScrollToTop />
        <PushNotificationHandler />
        <main className="min-h-screen">
          {children}
        </main>
        <BottomNavigation />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
