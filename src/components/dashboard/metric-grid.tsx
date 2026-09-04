"use client";

import { CalendarOff } from "lucide-react";
import { useMemo } from "react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCardSkeleton } from "@/components/ui/skeleton";
import { buildMetricSummaries, seriesInRange } from "@/lib/metrics";
import { useFilters } from "@/providers/filter-provider";

const GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-4";

/**
 * The metric row, bound to the global range. Skeletons occupy exactly the
 * cards' footprint, so a filter change never moves the page.
 */
export function MetricGrid() {
  const { range, isRefreshing } = useFilters();
  const summaries = useMemo(() => buildMetricSummaries(range), [range]);
  const hasData = useMemo(() => seriesInRange(range).length > 0, [range]);

  if (isRefreshing) {
    return (
      <div className={GRID}>
        {Array.from({ length: 4 }, (_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={CalendarOff}
        title="No data in this range"
        description="The demo dataset does not cover these dates. Pick a preset or a range inside the available window."
      />
    );
  }

  return (
    <div className={GRID}>
      {summaries.map((summary) => (
        <MetricCard key={summary.id} summary={summary} />
      ))}
    </div>
  );
}
