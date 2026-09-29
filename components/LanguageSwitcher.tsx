"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Czech-side paths that already have a working /en counterpart. Extend this
// as more pages get an English version - a stale link is worse than no
// switcher at all, so it stays hidden until a page has actually been built.
const TRANSLATED_PATHS = ["/", "/kavarny", "/cukrarny", "/kuchyne", "/lokality", "/trendy", "/akce", "/pobliz"];

export default function LanguageSwitcher() {
  const pathname = usePathname();

  if (pathname.includes("/admin")) return null;

  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const normalizedCsPath = (isEnglish ? pathname.replace(/^\/en/, "") || "/" : pathname).replace(/\/$/, "") || "/";

  if (!TRANSLATED_PATHS.includes(normalizedCsPath)) return null;

  const targetHref = isEnglish
    ? normalizedCsPath
    : `/en${normalizedCsPath === "/" ? "" : normalizedCsPath}`;

  return (
    <Link
      href={targetHref}
      className="fixed top-3 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-hairline rounded-full shadow-md shadow-black/5 text-xs font-semibold text-ink-mid hover:border-terracotta hover:text-terracotta transition-colors"
    >
      {isEnglish ? "🇨🇿 CS" : "🇬🇧 EN"}
    </Link>
  );
}
