import '../[locale]/globals.css';
import HamburgerMenu from '@/components/HamburgerMenu';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/cs.json';

export default function CsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="antialiased">
        <NextIntlClientProvider locale="cs" messages={messages}>
          <HamburgerMenu />
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
