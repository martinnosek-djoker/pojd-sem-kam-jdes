"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [loaded, setLoaded] = useState(false);

  // Reset only when the address really changes. A reset on mount would undo the "already loaded" check below.
  const previousPrimary = useRef(primary);
  useEffect(() => {
    if (previousPrimary.current === primary) return;
    previousPrimary.current = primary;
    setStage(0);
    setLoaded(false);
  }, [primary]);

  // An image that finished loading before React attached onLoad (server-rendered, or cached) would
  // otherwise stay invisible, so check it as soon as the element mounts.
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  const src = stage === 0 ? primary : stage === 1 ? fallback : null;
  const onError = () => {
    setLoaded(false);
    if (stage === 0 && fallback && fallback !== primary) setStage(1);
    else setStage(2);
  };
  const onLoad = () => setLoaded(true);

  return { src, onError, onLoad, ref, loaded };
}
