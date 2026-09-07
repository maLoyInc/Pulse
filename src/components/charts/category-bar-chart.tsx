"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { formatCurrencyCompact } from "@/lib/format";
import type { CategoryDatum } from "@/lib/types";

export interface BarDatum extends CategoryDatum {
  label: string;
  share: number;
}

/* Recharts in its own chunk; the box stays here so nothing shifts on the swap.
   See `trend-chart.tsx` for why this split is free. */
const CategoryBarPlot = dynamic(
  () => import("./category-bar-plot").then((m) => m.CategoryBarPlot),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

/**
 * Revenue per product category. Nominal categories with no natural order, so
 * every bar is the same colour — colouring by size would double-encode the bar
 * length and burn the only free channel on information already on screen.
 */
export function CategoryBarChart({
  data,
  height = 260,
}: {
  data: readonly CategoryDatum[];
  height?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const rows: BarDatum[] = data.map((item) => ({
    ...item,
    label: formatCurrencyCompact(item.value),
    share: total === 0 ? 0 : (item.value / total) * 100,
  }));

  return (
    <div style={{ height }}>
      <CategoryBarPlot rows={rows} />
    </div>
  );
}
