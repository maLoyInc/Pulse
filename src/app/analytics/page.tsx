import type { Metadata } from "next";
import { CategoryRevenueCard } from "@/components/dashboard/category-revenue-card";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { TrafficMixCard } from "@/components/dashboard/traffic-mix-card";
import { TrendCard } from "@/components/dashboard/trend-card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Trends over time, revenue by product category and traffic source mix for the selected date range.",
};

/**
 * Analytics: the same global range as Overview, three questions deep — how the
 * headline metric moved, which categories earned it, and where the traffic came
 * from.
 */
export default function AnalyticsPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Analytics"
        description="Trends, category mix and traffic sources for the selected range."
      />

      <DateRangeFilter />
      <TrendCard switchable height={300} />

      <div className="grid gap-4 xl:grid-cols-2">
        <CategoryRevenueCard />
        <TrafficMixCard />
      </div>
    </div>
  );
}
