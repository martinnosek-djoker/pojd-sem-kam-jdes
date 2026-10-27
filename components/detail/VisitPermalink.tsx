"use client";

import Link from "next/link";
import type { Visit } from "@/lib/types";
import type { Locale } from "@/lib/i18n/LocaleContext";
import { IS_STATIC_APP, visitPath } from "@/lib/slug";
import { openDetail } from "@/lib/app-detail";

const linkClasses = "text-sm font-semibold text-terracotta hover:text-terracotta-dark transition-colors";

// "Full visit" link under a visit on a place page: a normal route on the web, the in-app
// detail dialog in the native app (which has no per-visit routes).
export default function VisitPermalink({
  visit,
  placeName,
  locale,
  label,
}: {
  visit: Visit;
  placeName: string;
  locale: Locale;
  label: string;
}) {
  if (IS_STATIC_APP) {
    return (
      <button type="button" onClick={() => openDetail({ type: "visit", visit, locale })} className={linkClasses}>
        {label}
      </button>
    );
  }

  return (
    <Link href={visitPath(placeName, visit.visit_date, visit.id, locale)} scroll={false} className={linkClasses}>
      {label}
    </Link>
  );
}
