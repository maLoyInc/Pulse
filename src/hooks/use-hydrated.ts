"use client";

import { useSyncExternalStore } from "react";

/** Nothing to subscribe to: hydration happens exactly once. */
const subscribe = () => () => {};

/**
 * `false` on the server and through hydration, `true` afterwards.
 *
 * Anything that depends on browser-only state (the resolved theme, storage)
 * needs this so the first client render matches the server's HTML. Written as
 * an external store rather than `useState` + `useEffect` because that
 * cascading-render pattern is what `react-hooks/set-state-in-effect` flags.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
