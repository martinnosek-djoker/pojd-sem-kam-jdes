import type { Metadata } from "next";
import "./globals.css";
import HamburgerMenu from "@/components/HamburgerMenu";

export const metadata: Metadata = {
  title: "Pojď sem! Kam jdeš?",
  description: "Osobní doporučení nejlepších restaurací v Praze",
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
      </body>
    </html>
  );
}
