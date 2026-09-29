"use client";

import { useEffect } from "react";

// The root layout owns the single <html> tag Next.js allows, and it's
// permanently lang="cs". This nudges it to "en" for the /en tree without
// needing middleware (which the static mobile export can't run).
export default function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  return null;
}
