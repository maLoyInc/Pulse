import type {
  CategoryDatum,
  DailyMetric,
  DateRange,
  MetricKey,
} from "./types";
import {
  PRODUCT_CATEGORIES,
  TRAFFIC_CHANNELS,
  timeSeries,
} from "./mock-data";
import { addISODays, previousRange } from "./date";

export interface MetricTotals {
  revenue: number;
  users: number;
  orders: number;
}

export function seriesInRange(range: DateRange): DailyMetric[] {
  return timeSeries.filter((d) => d.date >= range.from && d.date <= range.to);
}

export function sumMetrics(days: DailyMetric[]): MetricTotals {
  return days.reduce<MetricTotals>(
    (acc, day) => {
      acc.revenue += day.revenue;
      acc.users += day.users;
      acc.orders += day.orders;
      return acc;
    },
    { revenue: 0, users: 0, orders: 0 },
  );
}

/** Percent change, or `null` when there is no baseline to compare against. */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Revenue momentum: the 7 days ending at `anchor` against the 7 before them.
 * Deliberately independent of the selected range length, so the Growth Rate
 * card measures something the Revenue card's own delta does not already say.
 */
export function weeklyMomentum(anchor: string): number | null {
  const current = sumMetrics(
    seriesInRange({ from: addISODays(anchor, -6), to: anchor }),
  ).revenue;
  const prior = sumMetrics(
    seriesInRange({ from: addISODays(anchor, -13), to: addISODays(anchor, -7) }),
  ).revenue;
  return percentChange(current, prior);
}

/** Up to `count` evenly spaced values — the metric card sparkline. */
export function sparkline(
  days: DailyMetric[],
  metric: MetricKey,
  count = 12,
): number[] {
  if (days.length <= count) return days.map((d) => d[metric]);
  const step = (days.length - 1) / (count - 1);
  return Array.from(
    { length: count },
    (_, i) => days[Math.round(i * step)][metric],
  );
}

export type MetricCardId = MetricKey | "growth";

export interface MetricSummary {
  id: MetricCardId;
  label: string;
  value: number;
  kind: "currency" | "count" | "percent";
  /** Percent change for totals, percentage points for the growth rate. */
  delta: number | null;
  deltaUnit: "percent" | "pp";
  comparison: string;
  spark: number[];
}

/** The metric cards for a range, each with its own comparison baseline. */
export function buildMetricSummaries(range: DateRange): MetricSummary[] {
  const prev = previousRange(range);
  const days = seriesInRange(range);
  const prevDays = seriesInRange(prev);
  const current = sumMetrics(days);
  const baseline = sumMetrics(prevDays);

  const momentum = weeklyMomentum(range.to);
  const priorMomentum = weeklyMomentum(prev.to);

  const totals: { id: MetricKey; label: string; kind: "currency" | "count" }[] = [
    { id: "revenue", label: "Total revenue", kind: "currency" },
    { id: "users", label: "Total users", kind: "count" },
    { id: "orders", label: "Total orders", kind: "count" },
  ];

  const cards: MetricSummary[] = totals.map(({ id, label, kind }) => ({
    id,
    label,
    kind,
    value: current[id],
    delta: percentChange(current[id], baseline[id]),
    deltaUnit: "percent",
    comparison: "vs previous period",
    spark: sparkline(days, id),
  }));

  cards.push({
    id: "growth",
    label: "Growth rate",
    kind: "percent",
    value: momentum ?? 0,
    delta:
      momentum === null || priorMomentum === null
        ? null
        : momentum - priorMomentum,
    deltaUnit: "pp",
    comparison: "7-day revenue momentum",
    spark: sparkline(days, "revenue"),
  });

  return cards;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export function trendSeries(range: DateRange, metric: MetricKey): TrendPoint[] {
  return seriesInRange(range).map((day) => ({
    date: day.date,
    value: day[metric],
  }));
}

/** Sessions per channel across the range, weighted by each day's traffic mix. */
export function trafficDistribution(range: DateRange): CategoryDatum[] {
  const days = seriesInRange(range);
  return TRAFFIC_CHANNELS.map((channel) => ({
    name: channel.charAt(0).toUpperCase() + channel.slice(1),
    value: Math.round(
      days.reduce(
        (acc, day) => acc + (day.users * day.trafficSource[channel]) / 100,
        0,
      ),
    ),
  }));
}

/** Revenue per product category across the range, derived from the daily mix. */
export function revenueByCategory(range: DateRange): CategoryDatum[] {
  const days = seriesInRange(range);
  return PRODUCT_CATEGORIES.map((category) => ({
    name: category,
    value: Math.round(
      days.reduce(
        (acc, day) => acc + (day.revenue * day.categoryMix[category]) / 100,
        0,
      ),
    ),
  })).sort((a, b) => b.value - a.value);
}
