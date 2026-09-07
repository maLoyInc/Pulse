"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { formatDateLong } from "@/lib/date";
import { METRIC_META } from "@/lib/metric-meta";
import type { TrendPoint } from "@/lib/metrics";
import type { MetricKey } from "@/lib/types";

/*
 * Recharts is ~400 KB unpacked and draws nothing on the server: its
 * ResponsiveContainer waits for a ResizeObserver measurement, so the
 * server-rendered markup is an empty box either way. Loading it in its own
 * chunk therefore costs no visible content and takes the library off the
 * critical path.
 *
 * The fixed-height box lives here, in the eagerly loaded half, so the
 * placeholder and the plot occupy exactly the same space — `loading` receives
 * no props and could not be told the height even if it wanted it. That is what
 * keeps Cumulative Layout Shift at zero across the swap.
 */
const TrendPlot = dynamic(() => import("./trend-plot").then((m) => m.TrendPlot), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

/**
 * A single metric over time. One series only — comparing revenue against user
 * counts would need a second y-scale, and a dual-axis chart invents
 * correlations that are not in the data. The metric switcher swaps the series
 * instead.
 */
export function TrendChart({
  points,
  metric,
  height = 280,
}: {
  points: readonly TrendPoint[];
  metric: MetricKey;
  height?: number;
}) {
  if (points.length === 1) return <SingleDayReadout point={points[0]} metric={metric} />;

  return (
    <div style={{ height }}>
      <TrendPlot points={points} metric={metric} />
    </div>
  );
}

/**
 * A one-day range has no trend to draw, so the number becomes the chart. Plain
 * markup, so it stays in the eager module: this branch never pays for Recharts.
 */
function SingleDayReadout({
  point,
  metric,
}: {
  point: TrendPoint;
  metric: MetricKey;
}) {
  const meta = METRIC_META[metric];
  return (
    <div className="flex flex-col items-start justify-center gap-1 rounded-lg border border-dashed border-line bg-surface-2/40 px-5 py-10">
      <p className="text-xs font-medium text-fg-muted">
        {meta.label} on {formatDateLong(point.date)}
      </p>
      <p className="text-4xl font-semibold tracking-tight text-fg">
        {meta.full(point.value)}
      </p>
      <p className="text-xs text-fg-subtle">
        A single day has no trend line — pick 7 days or more to see one.
      </p>
    </div>
  );
}
