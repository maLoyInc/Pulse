import type { Metadata } from "next";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { InsightBanner } from "@/components/dashboard/insight-banner";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { TrendCard } from "@/components/dashboard/trend-card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Headline revenue, users and growth for the selected date range, with an automatic insight on the latest move.",
};

/**
 * Overview: the filter row scopes everything under it, then the numbers, then
 * the trend behind them — headline first, detail after.
 */
export default function OverviewPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Overview"
        description="Your headline numbers for the selected range, and what moved."
      />

      <DateRangeFilter />
      <InsightBanner />
      <MetricGrid />
      <TrendCard />
    </div>
  );
}
