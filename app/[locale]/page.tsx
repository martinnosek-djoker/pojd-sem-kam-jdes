import HomePage from '@/components/HomePage';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <HomePage />;
}
