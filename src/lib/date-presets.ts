import { addISODays } from "./date";
import { DATA_END_ISO, DATA_START_ISO } from "./mock-data";
import type { DateRange, RangePresetId } from "./types";

export interface RangePreset {
  id: Exclude<RangePresetId, "custom">;
  label: string;
  /** Inclusive day count, counting back from the last day of data. */
  days: number;
}

export const RANGE_PRESETS: readonly RangePreset[] = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
];

export const DEFAULT_PRESET: Exclude<RangePresetId, "custom"> = "30d";

/** The pickers clamp to the window the mock data actually covers. */
export const MIN_DATE = DATA_START_ISO;
export const MAX_DATE = DATA_END_ISO;

export function rangeForPreset(id: Exclude<RangePresetId, "custom">): DateRange {
  const preset = RANGE_PRESETS.find((p) => p.id === id) ?? RANGE_PRESETS[2];
  return {
    from: addISODays(MAX_DATE, -(preset.days - 1)),
    to: MAX_DATE,
  };
}

export function presetLabel(id: RangePresetId): string {
  if (id === "custom") return "Custom range";
  return RANGE_PRESETS.find((p) => p.id === id)?.label ?? "30 days";
}
