import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";
import PushNotificationHandler from "@/components/PushNotificationHandler";
import ScrollToTop from "@/components/ScrollToTop";
import BetaTesterBanner from "@/components/BetaTesterBanner";
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
    "TOP 10 trendů v Praze! Objevte trendy restaurace, nejlepší kavárny a cukrárny v Praze. Osobní doporučení podle lokality, typu kuchyně nebo ve vašem okolí.",
  keywords: [
    "top 10 podniků o kterých se dnes mluví",
    "top 10 podniků praha",
    "cukrárny v Praze",
    "nejlepší cukrárny Praha",
    "kam na dort Praha",
    "kavárny v Praze",
    "nejlepší kavárny Praha",
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
    "gastro akce Praha",
    "food festival Praha",
    "kalendář gastro akcí",
    "kulinarní události Praha",
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
    title: "TOP 10 trendů | Pojď sem! Kam jdeš?",
    description:
      "Objevte TOP 10 trendů v Praze! Trendy restaurace, kavárny a cukrárny. Osobní doporučení nejlepších míst.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TOP 10 trendů Praha - Pojď sem! Kam jdeš?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOP 10 trendů | Pojď sem! Kam jdeš?",
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
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="antialiased pb-20 pt-14 bg-black">
        <BetaTesterBanner />
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
