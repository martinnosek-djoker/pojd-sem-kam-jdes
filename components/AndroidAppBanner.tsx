"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "androidBanner:dismissedAt";
const SNOOZE_DAYS = 30;

// Thin bar at the top of the website, only for Android browsers (not inside the
// native app itself), pointing to the page that explains how to join the test.
export default function AndroidAppBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  useEffect(() => {
    const isAndroidBrowser = /Android/i.test(navigator.userAgent) && !(window as any).Capacitor;
    if (!isAndroidBrowser) return;

    try {
      const dismissedAt = Number(window.localStorage.getItem(STORAGE_KEY));
      if (dismissedAt && Date.now() - dismissedAt < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return;
    } catch {
      // storage blocked: just show it
    }
    setVisible(true);
  }, []);

  if (!visible || pathname.includes("/admin") || pathname.endsWith("/android")) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-terracotta text-white text-sm">
      <div className="max-w-6xl mx-auto flex items-center gap-2 pl-2 pr-24 py-2">
        <button
          type="button"
          onClick={dismiss}
          aria-label={isEnglish ? "Close" : "Zavřít"}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-white/15 text-lg leading-none"
        >
          ×
        </button>
        <span className="min-w-0 flex-1 leading-tight">
          📱 {isEnglish ? "Try our new Android app" : "Vyzkoušej naši novou Android appku"}
        </span>
        <Link
          href={isEnglish ? "/en/android" : "/android"}
          className="flex-shrink-0 bg-white text-terracotta-dark font-semibold rounded-full px-3 py-1 hover:bg-surface-2"
        >
          {isEnglish ? "Try it" : "Vyzkoušet"}
        </Link>
      </div>
    </div>
  );
}
