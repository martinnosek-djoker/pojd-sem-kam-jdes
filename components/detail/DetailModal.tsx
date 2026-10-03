"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Shown over the current page when a card is clicked (intercepted route); the
// same content is also a full indexable page when the URL is opened directly.
export default function DetailModal({ children, closeLabel = "×" }: { children: React.ReactNode; closeLabel?: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center sm:p-6"
      onClick={() => router.back()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-bg w-full sm:max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl shadow-2xl px-4 sm:px-8 pt-12 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={closeLabel}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-surface border border-hairline text-ink text-xl flex items-center justify-center hover:border-terracotta hover:text-terracotta transition-colors"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
