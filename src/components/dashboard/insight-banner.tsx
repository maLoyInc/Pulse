"use client";

import { TrendingDown, TrendingUp, X } from "lucide-react";
import { useMemo } from "react";
import {
  useSessionValue,
  writeSessionValue,
} from "@/hooks/use-session-value";
import { buildInsight } from "@/lib/insight";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pulse:dismissed-insight";

const TONE = {
  up: {
    icon: TrendingUp,
    ring: "border-l-pos",
    chip: "bg-pos-soft text-pos-strong",
  },
  down: {
    icon: TrendingDown,
    ring: "border-l-neg",
    chip: "bg-neg-soft text-neg-strong",
  },
} as const;

/**
 * The automatic insight. Everything in it is computed from the mock series —
 * the copy is assembled, not written — and a move smaller than the
 * significance threshold produces no banner at all, so it never becomes noise
 * people learn to skip.
 *
 * Dismissal is per session: the banner stays closed for as long as the tab
 * lives, and comes back on a fresh one.
 */
export function InsightBanner() {
  const insight = useMemo(() => buildInsight(), []);
  const dismissedId = useSessionValue(STORAGE_KEY);

  if (!insight || dismissedId === insight.id) return null;

  const { icon: Icon, ring, chip } = TONE[insight.direction];

  const dismiss = () => writeSessionValue(STORAGE_KEY, insight.id);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-card border border-line border-l-2 bg-surface p-4",
        ring,
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          chip,
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">{insight.headline}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
          {insight.detail}
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss insight"
        className="-m-1 rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
