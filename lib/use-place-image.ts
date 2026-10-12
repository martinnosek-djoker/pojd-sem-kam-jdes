"use client";

import { useEffect, useState } from "react";
import { getProxiedImageUrl, getImageFallbackUrl } from "@/lib/api-config";

// Picture for a place card. The native app tries its bundled copy first and, if that file
// doesn't exist (e.g. a place added after the app was built), falls back to the live image
// instead of giving up. Errors are reset whenever the source changes, so a failed first
// attempt (stale build-time data) doesn't leave the card stuck on the placeholder.
export function usePlaceImage(
  imageUrl: string | null | undefined,
  name: string | undefined,
  category: string = "restaurants"
) {
  const primary = getProxiedImageUrl(imageUrl, name, category);
  const fallback = getImageFallbackUrl(imageUrl);
  const [stage, setStage] = useState<0 | 1 | 2>(0); // 0 = primary, 1 = fallback, 2 = failed

  useEffect(() => {
    setStage(0);
  }, [primary]);

  const src = stage === 0 ? primary : stage === 1 ? fallback : null;
  const onError = () => {
    if (stage === 0 && fallback && fallback !== primary) setStage(1);
    else setStage(2);
  };

  return { src, onError };
}
