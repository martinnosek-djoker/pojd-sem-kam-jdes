import '../[locale]/globals.css';
import HamburgerMenu from '@/components/HamburgerMenu';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NextIntlClientProvider locale="en" messages={messages}>
          <HamburgerMenu />
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
