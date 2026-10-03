"use client";

import { useState } from "react";

interface HeroImageProps {
  src: string | null | undefined;
  alt: string;
  fallbackEmoji: string;
}

// Many place photos are third-party URLs that can go stale, so fall back to a
// neutral placeholder instead of a broken-image icon.
export default function HeroImage({ src, alt, fallbackEmoji }: HeroImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="h-56 sm:h-72 rounded-2xl overflow-hidden bg-surface-2 mb-5 shadow-md shadow-black/5">
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30" aria-hidden="true">
          {fallbackEmoji}
        </div>
      )}
    </div>
  );
}
