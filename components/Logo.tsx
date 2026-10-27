"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Header logo: links to the homepage (like on any site). The language comes from the URL, since
// the logo also sits in loading skeletons that are rendered outside the locale provider.
export default function Logo() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const homeHref = isEnglish ? "/en" : "/";
  const onHome = pathname.replace(/\/$/, "") === homeHref.replace(/\/$/, "");

  return (
    <Link
      href={homeHref}
      // Already on the homepage: nothing to navigate to, so go back to the top instead
      onClick={onHome ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : undefined}
      className="flex items-center gap-2 md:gap-3 justify-center hover:opacity-80 transition-opacity"
    >
      <img
        src="/images/logo-mark.png"
        alt=""
        className="w-10 h-auto md:w-14"
      />

      <h1 className="text-base sm:text-lg md:text-2xl font-serif font-semibold text-ink tracking-wide leading-tight">
        Pojď sem! Kam jdeš?
      </h1>
    </Link>
  );
}
