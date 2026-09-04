"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isValidRange } from "@/lib/date";
import { DEFAULT_PRESET, rangeForPreset } from "@/lib/date-presets";
import type { DateRange, RangePresetId } from "@/lib/types";

/**
 * The date range lives here so Overview, Analytics and the table all read the
 * same slice — one filter row scopes everything below it.
 *
 * Mock data is synchronous, so `isRefreshing` is a deliberate short settle
 * window: it gives the designed skeletons somewhere to appear (the PRD asks for
 * a loading state on filter change) without any layout shift, since every
 * skeleton occupies its component's real footprint.
 */
const SETTLE_MS = 220;

interface FilterContextValue {
  presetId: RangePresetId;
  range: DateRange;
  isRefreshing: boolean;
  selectPreset: (id: Exclude<RangePresetId, "custom">) => void;
  /** Returns false (and changes nothing) when the range is invalid. */
  applyCustomRange: (range: DateRange) => boolean;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetId] = useState<RangePresetId>(DEFAULT_PRESET);
  const [range, setRange] = useState<DateRange>(() =>
    rangeForPreset(DEFAULT_PRESET),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timer = useRef<number | null>(null);

  const settle = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setIsRefreshing(true);
    timer.current = window.setTimeout(() => {
      setIsRefreshing(false);
      timer.current = null;
    }, SETTLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const selectPreset = useCallback(
    (id: Exclude<RangePresetId, "custom">) => {
      setPresetId(id);
      setRange(rangeForPreset(id));
      settle();
    },
    [settle],
  );

  const applyCustomRange = useCallback(
    (next: DateRange) => {
      if (!isValidRange(next)) return false;
      setPresetId("custom");
      setRange(next);
      settle();
      return true;
    },
    [settle],
  );

  const value = useMemo<FilterContextValue>(
    () => ({ presetId, range, isRefreshing, selectPreset, applyCustomRange }),
    [presetId, range, isRefreshing, selectPreset, applyCustomRange],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside <FilterProvider>");
  return ctx;
}
