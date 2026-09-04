"use client";

import { CalendarRange } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/field";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { formatRangeLabel, rangeLength } from "@/lib/date";
import { MAX_DATE, MIN_DATE, RANGE_PRESETS } from "@/lib/date-presets";
import { useFilters } from "@/providers/filter-provider";
import type { RangePresetId } from "@/lib/types";

const PRESET_OPTIONS: SegmentedOption<RangePresetId>[] = RANGE_PRESETS.map(
  (preset) => ({ value: preset.id, label: preset.label }),
);

/**
 * The one filter row that scopes every card below it — presets first, custom
 * range behind a toggle, because nobody wants to fight a calendar for
 * "last 30 days".
 */
export function DateRangeFilter() {
  const { presetId, range, selectPreset, applyCustomRange } = useFilters();
  const [customOpen, setCustomOpen] = useState(presetId === "custom");
  const [draft, setDraft] = useState({ from: range.from, to: range.to });
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  const days = rangeLength(range);

  // Keep the custom fields showing whatever range is actually active, so opening
  // the panel after clicking a preset never presents stale dates.
  const rangeKey = `${range.from}:${range.to}`;
  const [lastRangeKey, setLastRangeKey] = useState(rangeKey);
  if (rangeKey !== lastRangeKey) {
    setLastRangeKey(rangeKey);
    setDraft({ from: range.from, to: range.to });
    setError(null);
  }

  const handlePreset = (id: RangePresetId) => {
    if (id === "custom") return;
    setError(null);
    setCustomOpen(false);
    selectPreset(id as Exclude<RangePresetId, "custom">);
  };

  const handleApply = () => {
    if (draft.from > draft.to) {
      setError("Start date must be on or before the end date.");
      return;
    }
    if (!applyCustomRange(draft)) {
      setError("Enter two complete dates to apply a custom range.");
      return;
    }
    setError(null);
  };

  return (
    <section aria-label="Date range" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Segmented
          label="Date range preset"
          options={PRESET_OPTIONS}
          value={presetId}
          onChange={handlePreset}
        />

        <Button
          variant={presetId === "custom" ? "primary" : "secondary"}
          size="sm"
          aria-expanded={customOpen}
          onClick={() => setCustomOpen((open) => !open)}
        >
          <CalendarRange className="size-3.5" aria-hidden />
          Custom range
        </Button>

        <p className="w-full text-xs text-fg-muted sm:ml-auto sm:w-auto">
          {formatRangeLabel(range)}
          <span className="text-fg-subtle">
            {" · "}
            {days} {days === 1 ? "day" : "days"}
          </span>
        </p>
      </div>

      {customOpen ? (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface-2 p-3">
          <DateField
            label="Start date"
            value={draft.from}
            min={MIN_DATE}
            max={MAX_DATE}
            invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) =>
              setDraft((current) => ({ ...current, from: event.target.value }))
            }
            className="w-40"
          />
          <DateField
            label="End date"
            value={draft.to}
            min={MIN_DATE}
            max={MAX_DATE}
            invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) =>
              setDraft((current) => ({ ...current, to: event.target.value }))
            }
            className="w-40"
          />
          <Button variant="primary" size="md" onClick={handleApply}>
            Apply range
          </Button>
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="w-full text-xs font-medium text-neg-strong"
            >
              {error}
            </p>
          ) : (
            <p className="w-full text-xs text-fg-subtle sm:w-auto">
              Data available from {formatRangeLabel({ from: MIN_DATE, to: MAX_DATE })}.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
