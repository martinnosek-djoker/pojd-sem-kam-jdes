import Link from "next/link";
import type { Locale } from "@/lib/i18n/LocaleContext";

interface DetailShellProps {
  locale: Locale;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
}

// Detail pages render their own <h1> (the place name), so the site logo here is
// a plain link rather than the shared <Logo/>, which contains an <h1>.
export default function DetailShell({ locale, backHref, backLabel, children }: DetailShellProps) {
  return (
    <main className="min-h-screen px-4 sm:px-8 pb-32 bg-bg">
      <div className="max-w-3xl mx-auto">
        <div className="pt-10 md:pt-8 mb-6 text-center">
          <Link href={locale === "en" ? "/en" : "/"} className="inline-flex items-center gap-2 md:gap-3 justify-center">
            <img src="/images/logo-mark.png" alt="" className="w-10 h-auto md:w-12" />
            <span className="text-base sm:text-lg md:text-xl font-serif font-semibold text-ink tracking-wide">Pojď sem! Kam jdeš?</span>
          </Link>
        </div>

        <Link href={backHref} className="inline-block mb-4 text-sm font-semibold text-terracotta hover:text-terracotta-dark transition-colors">
          {backLabel}
        </Link>

        {children}
      </div>
    </main>
  );
}
