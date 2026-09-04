"use client";

import { useMemo } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { TrafficDonutChart } from "@/components/charts/traffic-donut-chart";
import { formatRangeLabel } from "@/lib/date";
import { formatNumber, formatPercent } from "@/lib/format";
import { trafficDistribution } from "@/lib/metrics";
import { useFilters } from "@/providers/filter-provider";

const HEIGHT = 220;

/**
 * Where the sessions came from. Four channels of one whole, which is the only
 * shape a donut reads well — past six slices it becomes a colour-matching game.
 */
export function TrafficMixCard() {
  const { range, isRefreshing } = useFilters();
  const data = useMemo(() => trafficDistribution(range), [range]);

  const table = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return {
      columns: ["Channel", "Sessions", "Share"],
      rows: data.map((item) => [
        item.name,
        formatNumber(item.value),
        formatPercent(total === 0 ? 0 : (item.value / total) * 100),
      ]),
    };
  }, [data]);

  return (
    <ChartCard
      title="Traffic sources"
      description={`Session share · ${formatRangeLabel(range)}`}
      table={table}
      isRefreshing={isRefreshing}
      isEmpty={data.every((item) => item.value === 0)}
      skeletonHeight={HEIGHT}
    >
      <TrafficDonutChart data={data} height={HEIGHT} />
    </ChartCard>
  );
}
