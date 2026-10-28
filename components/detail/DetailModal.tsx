"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tapHaptic } from "@/lib/haptics";

const CLOSE_MS = 200;
const SWIPE_CLOSE_PX = 110; // how far the sheet must be pulled down to dismiss it

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Shown over the current page when a card is clicked (intercepted route); the
// same content is also a full indexable page when the URL is opened directly.
// Slides up from the bottom (fades in on wider screens) and can be pulled down to dismiss.
export default function DetailModal({
  children,
  closeLabel = "×",
  onClose,
}: {
  children: React.ReactNode;
  closeLabel?: string;
  // The native app has no routes for the dialog, so it closes via its own state instead of history
  onClose?: () => void;
}) {
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [swipedAway, setSwipedAway] = useState(false);

  const finish = () => (onClose ? onClose() : router.back());

  // Play the exit animation first, then really close
  const requestClose = (viaSwipe = false) => {
    if (closing || swipedAway) return;
    if (viaSwipe) setSwipedAway(true);
    else setClosing(true);
    window.setTimeout(finish, prefersReducedMotion() ? 0 : CLOSE_MS);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, onClose, closing, swipedAway]);

  // Pull-down gesture: only when the content is scrolled to the top, so it never fights scrolling
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = (sheetRef.current?.scrollTop ?? 0) <= 0 ? e.touches[0].clientY : null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0 && (sheetRef.current?.scrollTop ?? 0) <= 0) setDragY(dy);
    else if (dy <= 0) setDragY(0);
  };
  const onTouchEnd = () => {
    const pulled = dragY;
    touchStartY.current = null;
    if (pulled > SWIPE_CLOSE_PX) {
      tapHaptic("light");
      requestClose(true);
    } else {
      setDragY(0);
    }
  };

  const sheetStyle: React.CSSProperties = swipedAway
    ? { transform: "translateY(100%)", transition: `transform ${CLOSE_MS}ms ease-in` }
    : dragY > 0
      ? { transform: `translateY(${dragY}px)`, transition: "none" }
      : { transition: "transform 0.2s ease-out" }; // snaps back when released early

  return (
    <div
      className={`dialog-backdrop ${closing || swipedAway ? "is-closing" : ""} fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center sm:p-6`}
      onClick={() => requestClose()}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        style={sheetStyle}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`dialog-sheet ${closing ? "is-closing" : ""} relative bg-bg w-full sm:max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl shadow-2xl px-4 sm:px-8 pt-12 pb-10`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => requestClose()}
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
