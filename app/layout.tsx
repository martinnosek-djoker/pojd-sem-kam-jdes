import "./globals.css";
import { Lora, Work_Sans } from "next/font/google";
import BottomNavigation from "@/components/BottomNavigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PushNotificationHandler from "@/components/PushNotificationHandler";
import BackButtonHandler from "@/components/BackButtonHandler";
import ScrollToTop from "@/components/ScrollToTop";
import StructuredData from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Nejlepší restaurace, kavárny a cukrárny v Praze | Pojď sem! Kam jdeš?",
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
  themeColor: '#FBF3E7',
  alternates: {
    canonical: "/",
    languages: {
      cs: "/",
      en: "/en",
    },
  },
  description:
    "Osobní doporučení nejlepších restaurací, kaváren a cukráren v Praze od @Peču si život. Vyhledávání podle lokality, typu kuchyně a vzdálenosti. TOP 10 trendů a prémiová káva.",
  keywords: [
    // Core - balanced across all categories
    "nejlepší restaurace Praha",
    "nejlepší kavárny Praha",
    "nejlepší cukrárny Praha",
    "doporučení restaurace Praha",
    "doporučení kavárny Praha",
    "kam v Praze",
    "kam na jídlo Praha",
    "kam na kávu Praha",
    "kam na snídani Praha",

    // Restaurants - Prague specific
    "top restaurace Praha",
    "trendy restaurace Praha",
    "oblíbené restaurace Praha",
    "restaurace Praha centrum",
    "restaurace Vinohrady",
    "restaurace Holešovice",
    "restaurace Karlín",
    "restaurace podle lokality Praha",
    "restaurace v okolí",

    // Cuisine types
    "světové kuchyně Praha",
    "italská restaurace Praha",
    "asijská restaurace Praha",
    "vietnamská restaurace Praha",
    "indická restaurace Praha",
    "české restaurace Praha",
    "japonská restaurace Praha",
    "mexická restaurace Praha",

    // Cafes - expanded keywords
    "kavárny Praha",
    "specialty coffee Praha",
    "prémiová káva Praha",
    "nejlepší káva Praha",
    "kavárny Vinohrady",
    "kavárny Karlín",
    "kavárny centrum Praha",
    "kam na kávu Praha",
    "coffee shop Praha",
    "third wave coffee Praha",

    // Bakeries - expanded keywords
    "cukrárny Praha",
    "cukrárny v Praze",
    "kam na dort Praha",
    "nejlepší dorty Praha",
    "cukrárny Vinohrady",
    "pekárna Praha",
    "zákusky Praha",
    "dezerty Praha",

    // Breakfast & trends
    "kam na snídani Praha",
    "snídaně Praha",
    "brunch Praha",
    "top 10 trendů Praha",
    "top 10 podniků Praha",

    // Events (less priority but still there)
    "gastro akce Praha",
    "food festival Praha",
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
    title: "Nejlepší restaurace, kavárny a cukrárny v Praze | Doporučení od @Peču si život",
    description:
      "Osobní doporučení nejlepších gastro míst v Praze. Vyhledávání podle lokality, typu kuchyně a vzdálenosti. TOP 10 trendů, prémiová káva a skvělé dezerty.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nejlepší restaurace, kavárny a cukrárny v Praze - Doporučení Peču si život",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nejlepší restaurace, kavárny a cukrárny v Praze",
    description: "Osobní doporučení nejlepších gastro míst v Praze od @Peču si život. Vyhledávání podle lokality, typu kuchyně a vzdálenosti.",
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
  modal,
}: {
  children: React.ReactNode;
  // Parallel slot: card detail dialogs (intercepted routes). Undefined in the
  // static mobile build, where app/@modal is excluded.
  modal: React.ReactNode;
}) {
  return (
    <html lang="cs" className={`${lora.variable} ${workSans.variable}`}>
      <head>
        <meta name="theme-color" content="#FBF3E7" />
      </head>
      <body className="antialiased pb-20 bg-bg text-ink font-sans">
        <StructuredData />
        <ScrollToTop />
        <PushNotificationHandler />
        <BackButtonHandler />
        <main className="min-h-screen">
          {children}
        </main>
        {modal}
        <BottomNavigation />
        <LanguageSwitcher />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
