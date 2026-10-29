"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProxiedImageUrl, getImageFallbackUrl, getImageVariantUrl, ImageWidth } from "@/lib/api-config";

// A failed request on a weak connection is usually just slow or dropped, so the same source is
// tried again a couple of times (with growing pauses) before giving up on it.
const RETRIES = 2;
const RETRY_DELAY_MS = 1500;

const withAttempt = (url: string, attempt: number) =>
  attempt === 0 ? url : `${url}${url.includes("?") ? "&" : "?"}_r=${attempt}`;

// Picture for a place card. Tries, in this order:
//  1. a right-sized copy from the site's /api/img (small and cached for a long time) - only when
//     `width` says how big the picture is shown,
//  2. the photo as it is (the native app loads it live from the site, so a new place or photo needs
//     no app release),
//  3. for Google-hosted photos, the site's proxy.
// Everything resets whenever the address changes, so stale build-time data doesn't leave the card
// stuck on the placeholder.
export function usePlaceImage(
  imageUrl: string | null | undefined,
  name: string | undefined,
  category: string = "restaurants",
  width?: ImageWidth
) {
  const variant = width ? getImageVariantUrl(imageUrl, width, name, category) : null;
  const primary = getProxiedImageUrl(imageUrl, name, category);
  const fallback = getImageFallbackUrl(imageUrl);
  const sources = [variant, primary, fallback].filter((s, i, all): s is string => !!s && all.indexOf(s) === i);
  const sourcesKey = sources.join("|");

  const [stage, setStage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const retryTimer = useRef<number | undefined>(undefined);

  // Reset only when the address really changes. A reset on mount would undo the "already loaded" check below.
  const previousKey = useRef(sourcesKey);
  useEffect(() => {
    if (previousKey.current === sourcesKey) return;
    previousKey.current = sourcesKey;
    window.clearTimeout(retryTimer.current);
    setStage(0);
    setAttempt(0);
    setLoaded(false);
  }, [sourcesKey]);

  useEffect(() => () => window.clearTimeout(retryTimer.current), []);

  // An image that finished loading before React attached onLoad (server-rendered, or cached) would
  // otherwise stay invisible, so check it as soon as the element mounts.
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  const base = sources[stage] ?? null;
  const src = base ? withAttempt(base, attempt) : null;

  const onError = () => {
    setLoaded(false);
    const failedKey = sourcesKey;
    const stillCurrent = () => previousKey.current === failedKey;
    const retry = () => {
      window.clearTimeout(retryTimer.current);
      retryTimer.current = window.setTimeout(() => {
        if (stillCurrent()) setAttempt((a) => a + 1);
      }, RETRY_DELAY_MS * (attempt + 1));
    };
    // this source is out; the next one (or the placeholder when there is none)
    const giveUp = () => {
      if (!stillCurrent()) return;
      setAttempt(0);
      setStage((s) => s + 1);
    };

    if (attempt >= RETRIES || !base) return giveUp();
    // A file that does not exist will not appear by waiting, a dropped connection might: ask once,
    // so missing photos fall through to the next source (or the placeholder) right away.
    fetch(base, { method: "HEAD", cache: "no-store" })
      .then((res) => (res.status >= 400 && res.status < 500 ? giveUp() : retry()))
      .catch(retry);
  };
  const onLoad = () => setLoaded(true);

  return { src, onError, onLoad, ref, loaded };
}
