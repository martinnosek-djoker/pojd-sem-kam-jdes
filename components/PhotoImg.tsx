"use client";

import { usePlaceImage } from "@/lib/use-place-image";
import type { ImageWidth } from "@/lib/api-config";

type PhotoImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width"> & {
  src: string;
  // how wide the photo is shown, so a right-sized copy is fetched instead of the original
  width: ImageWidth;
};

// A photo (from a visit, a gallery) that loads lazily, from a small cached copy first; if that
// fails it retries and then falls back to the original. Renders nothing when nothing works, so the
// parent's background stays.
export default function PhotoImg({ src, width, className = "", alt, ...rest }: PhotoImgProps) {
  const image = usePlaceImage(src, undefined, "restaurants", width);
  if (!image.src) return null;

  return (
    // loading/decoding are set before src on purpose: React applies props in this order, and an
    // image whose src is set before loading="lazy" is fetched immediately instead of lazily.
    <img
      {...rest}
      loading="lazy"
      decoding="async"
      src={image.src}
      alt={alt}
      ref={image.ref}
      onLoad={image.onLoad}
      onError={image.onError}
      className={`${className} img-fade ${image.loaded ? "is-loaded" : ""}`}
    />
  );
}
