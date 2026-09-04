import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import {
  directionOf,
  formatCompact,
  formatCurrencyCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatSignedPercent,
  type Direction,
} from "@/lib/format";
import type { MetricSummary } from "@/lib/metrics";
import { cn } from "@/lib/utils";

const DIRECTION_STYLE: Record<
  Direction,
  { icon: typeof Minus; className: string }
> = {
  up: { icon: ArrowUpRight, className: "bg-pos-soft text-pos-strong" },
  down: { icon: ArrowDownRight, className: "bg-neg-soft text-neg-strong" },
  flat: { icon: Minus, className: "bg-flat-soft text-flat-strong" },
};

function displayValue(summary: MetricSummary) {
  if (summary.kind === "currency") return formatCurrencyCompact(summary.value);
  if (summary.kind === "percent") return formatSignedPercent(summary.value);
  return formatCompact(summary.value);
}

function exactValue(summary: MetricSummary) {
  if (summary.kind === "currency") return formatCurrency(summary.value);
  if (summary.kind === "percent") return formatSignedPercent(summary.value);
  return formatNumber(summary.value);
}

/**
 * One headline number, its movement, and a 12-point trend.
 *
 * Every metric here is "up is good", so direction alone picks the colour — and
 * it never travels without an arrow, because colour on its own is not an
 * accessible signal.
 */
export function MetricCard({ summary }: { summary: MetricSummary }) {
  const direction = summary.delta === null ? "flat" : directionOf(summary.delta);
  const { icon: Icon, className } = DIRECTION_STYLE[direction];

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-sm shadow-black/[0.02] sm:p-5">
      <p className="text-xs font-medium text-fg-muted">{summary.label}</p>

      <p
        className="mt-2 text-2xl leading-9 font-semibold tracking-tight text-fg sm:text-3xl"
        title={exactValue(summary)}
      >
        {displayValue(summary)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        {summary.delta === null ? (
          <span className="inline-flex h-5 items-center rounded-full bg-flat-soft px-2 text-xs font-medium text-flat-strong">
            No baseline
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex h-5 items-center gap-1 rounded-full px-2 text-xs font-medium tnum",
              className,
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {summary.deltaUnit === "pp"
              ? `${summary.delta > 0 ? "+" : summary.delta < 0 ? "−" : ""}${formatPercent(
                  Math.abs(summary.delta),
                ).replace("%", " pp")}`
              : formatSignedPercent(summary.delta)}
          </span>
        )}
        <span className="text-[11px] text-fg-subtle">{summary.comparison}</span>
      </div>

      <Sparkline values={summary.spark} className="mt-4 h-8 w-full" />
    </div>
  );
}
