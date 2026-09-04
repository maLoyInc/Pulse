"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

/**
 * Read values are cached in memory: `useSyncExternalStore` calls the snapshot on
 * every render, and it must return the same reference until something actually
 * changes. The cache doubles as the fallback when storage is unavailable —
 * private browsing modes can throw on access — so a dismissal still sticks for
 * the current view even if it cannot be persisted.
 */
const cache = new Map<string, string | null>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(key: string): string | null {
  if (!cache.has(key)) {
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem(key);
    } catch {
      stored = null;
    }
    cache.set(key, stored);
  }
  return cache.get(key) ?? null;
}

/** Write a session value and tell every reader about it. */
export function writeSessionValue(key: string, value: string) {
  cache.set(key, value);
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Not persistable here; the in-memory cache still holds for this view.
  }
  for (const listener of listeners) listener();
}

/**
 * sessionStorage as a React store: `null` on the server, the stored value once
 * hydrated, and re-rendered on every `writeSessionValue`.
 */
export function useSessionValue(key: string): string | null {
  const getSnapshot = useCallback(() => snapshot(key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
