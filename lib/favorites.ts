"use client";

import { useCallback, useSyncExternalStore } from "react";

export type FavoriteKind = "restaurant" | "cafe";

// Favorites live only on this device (localStorage); there are no accounts yet.
const STORAGE_KEY = "favorites:v1";

type Store = Record<FavoriteKind, number[]>;

const EMPTY: Store = { restaurant: [], cafe: [] };
let snapshot: Store | null = null;
const listeners = new Set<() => void>();

function load(): Store {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      restaurant: Array.isArray(parsed?.restaurant) ? parsed.restaurant.filter(Number.isFinite) : [],
      cafe: Array.isArray(parsed?.cafe) ? parsed.cafe.filter(Number.isFinite) : [],
    };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): Store {
  if (snapshot === null) snapshot = load();
  return snapshot;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function toggleFavorite(kind: FavoriteKind, id: number) {
  const current = getSnapshot();
  const has = current[kind].includes(id);
  snapshot = { ...current, [kind]: has ? current[kind].filter((x) => x !== id) : [...current[kind], id] };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage blocked/full: the star still works for this session.
  }
  emit();
}

// Server render and the first client render see no favorites (so markup matches),
// then the real values arrive without a hydration mismatch.
export function useFavorites(kind: FavoriteKind) {
  const store = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const ids = store[kind];
  const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);
  const toggle = useCallback((id: number) => toggleFavorite(kind, id), [kind]);
  return { ids, isFavorite, toggle };
}

// Favorites first, otherwise keeping the incoming (already sorted) order.
export function pinFavorites<T extends { id: number }>(items: T[], favoriteIds: number[]): T[] {
  if (favoriteIds.length === 0) return items;
  const favorites = items.filter((i) => favoriteIds.includes(i.id));
  return [...favorites, ...items.filter((i) => !favoriteIds.includes(i.id))];
}
