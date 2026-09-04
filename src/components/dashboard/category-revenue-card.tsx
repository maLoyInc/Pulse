"use client";

import { useMemo } from "react";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { formatRangeLabel } from "@/lib/date";
import { formatCurrency, formatPercent } from "@/lib/format";
import { revenueByCategory } from "@/lib/metrics";
import { useFilters } from "@/providers/filter-provider";

const HEIGHT = 260;

/**
 * Revenue split by product category for the active range. Derived from the same
 * daily series as the metric cards, so the bars always add up to the Revenue
 * card — a table that disagrees with its own headline is worse than no table.
 */
export function CategoryRevenueCard() {
  const { range, isRefreshing } = useFilters();
  const data = useMemo(() => revenueByCategory(range), [range]);

  const table = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return {
      columns: ["Category", "Revenue", "Share"],
      rows: data.map((item) => [
        item.name,
        formatCurrency(item.value),
        formatPercent(total === 0 ? 0 : (item.value / total) * 100),
      ]),
    };
  }, [data]);

  return (
    <ChartCard
      title="Revenue by category"
      description={`Product mix · ${formatRangeLabel(range)}`}
      table={table}
      isRefreshing={isRefreshing}
      isEmpty={data.every((item) => item.value === 0)}
      skeletonHeight={HEIGHT}
    >
      <CategoryBarChart data={data} height={HEIGHT} />
    </ChartCard>
  );
}
