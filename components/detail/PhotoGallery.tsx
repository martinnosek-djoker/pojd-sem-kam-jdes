"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PhotoGalleryProps {
  photos: string[];
  altBase: string;
  photoWord: string;
  columns?: "3" | "4";
}

export default function PhotoGallery({ photos, altBase, photoWord, columns = "3" }: PhotoGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${columns === "4" ? "lg:grid-cols-4" : ""} gap-2`}>
        {photos.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            className="aspect-square overflow-hidden rounded-xl bg-surface-2 cursor-zoom-in"
          >
            <img src={url} alt={`${altBase} – ${photoWord} ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="×"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
            >
              ×
            </button>
            {photos.length > 1 && (
              <button
                type="button"
                aria-label="‹"
                onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
              >
                ‹
              </button>
            )}
            <img src={photos[open]} alt={`${altBase} – ${photoWord} ${open + 1}`} className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            {photos.length > 1 && (
              <button
                type="button"
                aria-label="›"
                onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? null : (i + 1) % photos.length)); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
              >
                ›
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
