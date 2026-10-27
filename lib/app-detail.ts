"use client";

import { useSyncExternalStore } from "react";
import type { Cafe, Restaurant, Visit } from "@/lib/types";
import type { Locale } from "@/lib/i18n/LocaleContext";
import type { PlaceKind } from "@/lib/slug";

// The native app is a static export, so it can't have the web's /restaurace/... routes.
// Instead a card click pushes a target onto this tiny stack and <AppDetailHost/> shows the
// same detail content in a dialog (the stack lets "similar places" go deeper, and the
// Android Back button step one level back).
export type DetailTarget =
  | { type: "place"; kind: PlaceKind; place: Restaurant | Cafe; locale: Locale }
  | { type: "visit"; visit: Visit; locale: Locale };

let stack: DetailTarget[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openDetail(target: DetailTarget) {
  stack = [...stack, target];
  emit();
}

// One level back; false when nothing was open (so Back can fall through to normal navigation)
export function closeDetail(): boolean {
  if (stack.length === 0) return false;
  stack = stack.slice(0, -1);
  emit();
  return true;
}

export function closeAllDetails() {
  if (stack.length === 0) return;
  stack = [];
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useCurrentDetail(): DetailTarget | null {
  return useSyncExternalStore(
    subscribe,
    () => stack[stack.length - 1] ?? null,
    () => null
  );
}
