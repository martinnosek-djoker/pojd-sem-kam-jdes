"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const isDetailPath = (path: string | null) => !!path && /^(\/en)?\/(restaurace|navstevy|kavarny\/[^/]+$)/.test(path);

export default function ScrollToTop() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    // Opening/closing a detail dialog changes the URL but must not jump the page behind it.
    const skip = previous.current !== null && (isDetailPath(pathname) || isDetailPath(previous.current));
    previous.current = pathname;
    if (!skip) window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
