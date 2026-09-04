"use client";

import { useMemo, useState } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Segmented } from "@/components/ui/segmented";
import { formatDateShort, formatRangeLabel, formatWeekday } from "@/lib/date";
import { METRIC_META, METRIC_OPTIONS } from "@/lib/metric-meta";
import { trendSeries } from "@/lib/metrics";
import type { MetricKey } from "@/lib/types";
import { useFilters } from "@/providers/filter-provider";

/**
 * The main time-series card, bound to the global range.
 *
 * `switchable` swaps the series instead of stacking a second y-axis on top of
 * the first: revenue in rupiah and users in people share no scale, and drawing
 * them together would imply a correlation the axes invented.
 */
export function TrendCard({
  switchable = false,
  height = 280,
}: {
  switchable?: boolean;
  height?: number;
}) {
  const { range, isRefreshing } = useFilters();
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const active = switchable ? metric : "revenue";
  const meta = METRIC_META[active];

  const points = useMemo(() => trendSeries(range, active), [range, active]);

  const table = useMemo(
    () => ({
      columns: ["Date", meta.label],
      rows: points.map((point) => [
        `${formatWeekday(point.date)}, ${formatDateShort(point.date)}`,
        meta.full(point.value),
      ]),
    }),
    [points, meta],
  );

  return (
    <ChartCard
      title={`${meta.label} over time`}
      description={`Daily ${meta.label.toLowerCase()} · ${formatRangeLabel(range)}`}
      actions={
        switchable ? (
          <Segmented
            label="Chart metric"
            options={METRIC_OPTIONS}
            value={metric}
            onChange={setMetric}
          />
        ) : null
      }
      table={table}
      isRefreshing={isRefreshing}
      isEmpty={points.length === 0}
      skeletonHeight={height}
    >
      <TrendChart points={points} metric={active} height={height} />
    </ChartCard>
  );
}
