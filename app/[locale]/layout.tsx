import "./globals.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const isCs = locale === 'cs';

  return {
    title: {
      default: isCs
        ? "Pojď sem! Kam jdeš? | Nejlepší restaurace v Praze"
        : "Come here! Where are you going? | Best restaurants in Prague",
      template: isCs
        ? "%s | Pojď sem! Kam jdeš?"
        : "%s | Come here! Where are you going?",
    },
    description: isCs
      ? "Osobní doporučení nejlepších restaurací, kaváren a cukráren v Praze. Objevte skvělá místa na jídlo podle lokality, typu kuchyně nebo ve vašem okolí."
      : "Personal recommendations for the best restaurants, cafés and bakeries in Prague. Discover great places to eat by location, cuisine type or nearby.",
    keywords: [
      "restaurace Praha",
      "restaurants Prague",
      "nejlepší restaurace Praha",
      "best restaurants Prague",
      "kam na jídlo Praha",
      "where to eat Prague",
      "restaurace v okolí",
      "restaurants nearby",
      "doporučení restaurace",
      "restaurant recommendations",
      "české restaurace",
      "Czech restaurants",
      "světové kuchyně Praha",
      "world cuisines Prague",
      "italská restaurace Praha",
      "Italian restaurant Prague",
      "asijská restaurace Praha",
      "Asian restaurant Prague",
      "kavárny Praha",
      "cafés Prague",
      "cukrárny Praha",
      "bakeries Prague",
    ],
    authors: [{ name: "Peču si život", url: "https://www.instagram.com/pecu_si_zivot/" }],
    creator: "Peču si život",
    publisher: "Pojď sem! Kam jdeš?",
    metadataBase: new URL("https://www.pojdsemkamjdes.cz"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'cs': '/cs',
        'en': '/en',
      },
    },
    openGraph: {
      type: "website",
      locale: isCs ? "cs_CZ" : "en_US",
      url: `https://www.pojdsemkamjdes.cz/${locale}`,
      siteName: "Pojď sem! Kam jdeš?",
      title: isCs
        ? "Pojď sem! Kam jdeš? | Nejlepší restaurace v Praze"
        : "Come here! Where are you going? | Best restaurants in Prague",
      description: isCs
        ? "Objevte nejlepší restaurace, kavárny a cukrárny v Praze. Osobní doporučení a tipy na skvělá místa."
        : "Discover the best restaurants, cafés and bakeries in Prague. Personal recommendations and tips for great places.",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: isCs
            ? "Pojď sem! Kam jdeš? - Restaurace v Praze"
            : "Come here! Where are you going? - Restaurants in Prague",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isCs
        ? "Pojď sem! Kam jdeš? | Nejlepší restaurace v Praze"
        : "Come here! Where are you going? | Best restaurants in Prague",
      description: isCs
        ? "Objevte nejlepší restaurace, kavárny a cukrárny v Praze"
        : "Discover the best restaurants, cafés and bakeries in Prague",
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
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <HamburgerMenu />
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
