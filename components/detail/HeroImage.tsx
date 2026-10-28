"use client";

import { usePlaceImage } from "@/lib/use-place-image";

interface HeroImageProps {
  src: string | null | undefined;
  alt: string;
  fallbackEmoji: string;
}

// Many place photos are third-party URLs that can go stale, so fall back to a
// neutral placeholder instead of a broken-image icon.
export default function HeroImage({ src, alt, fallbackEmoji }: HeroImageProps) {
  // In the native app the place photo may be a bundled file, a Google URL needing the proxy,
  // or missing from the bundle; the hook sorts that out (on the web it is just `src`).
  const image = usePlaceImage(src, undefined);

  return (
    <div className="h-56 sm:h-72 rounded-2xl overflow-hidden bg-surface-2 mb-5 shadow-md shadow-black/5">
      {image.src ? (
        <img
          src={image.src}
          alt={alt}
          referrerPolicy="no-referrer"
          ref={image.ref}
          onLoad={image.onLoad}
          onError={image.onError}
          className={`w-full h-full object-cover img-fade ${image.loaded ? "is-loaded" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30" aria-hidden="true">
          {fallbackEmoji}
        </div>
      )}
    </div>
  );
}
