import type { Locale } from "@/lib/i18n/LocaleContext";

export type PlaceKind = "restaurant" | "cafe";

// True only in the Capacitor static-export build (set in next.config.mobile.mjs).
// That build can't contain the dynamic detail routes, so cards keep linking out.
export const IS_STATIC_APP = process.env.NEXT_PUBLIC_MOBILE_BUILD === "true";

export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "podnik"
  );
}

// Slugs end in the row id, so lookups never depend on the name and a renamed
// place keeps working (the page redirects to the current canonical slug).
export function parseTrailingId(slug: string): number | null {
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

const prefix = (locale: Locale) => (locale === "en" ? "/en" : "");

export function placePath(kind: PlaceKind, name: string, id: number, locale: Locale = "cs"): string {
  const base = kind === "restaurant" ? "/restaurace" : "/kavarny";
  return `${prefix(locale)}${base}/${slugify(name)}-${id}`;
}

export function visitPath(placeName: string, visitDate: string, id: number, locale: Locale = "cs"): string {
  return `${prefix(locale)}/navstevy/${slugify(placeName)}-${visitDate.slice(0, 10)}-${id}`;
}
