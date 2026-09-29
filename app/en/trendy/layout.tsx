export const metadata = {
  title: "TOP 10 Trends in Prague's Food Scene",
  description: "The hottest tips and trends in Prague's food scene. Discover the TOP 10 places recommended by Peču si život.",
  alternates: {
    canonical: "/en/trendy",
    languages: {
      cs: "/trendy",
      en: "/en/trendy",
    },
  },
  openGraph: {
    title: "TOP 10 Trends in Prague's Food Scene | Pojď sem! Kam jdeš?",
    description: "The hottest tips and trends in Prague's food scene. Discover the TOP 10 places.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOP 10 Trends in Prague's Food Scene",
    description: "The hottest tips and trends in Prague's food scene",
  },
};

export default function EnglishTrendyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
