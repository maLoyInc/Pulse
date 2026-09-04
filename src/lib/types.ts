/** Shared data contracts for the whole app. All mock data is typed against these. */

export type MetricKey = "revenue" | "users" | "orders";

export type TrafficChannel = "organic" | "paid" | "referral" | "direct";

export type TrafficSplit = Record<TrafficChannel, number>;

/** One day of aggregated business metrics. */
export interface DailyMetric {
  /** ISO date, `YYYY-MM-DD`, always UTC-based so server and client agree. */
  date: string;
  revenue: number;
  users: number;
  orders: number;
  /** Share of that day's sessions per channel, in percent (sums to 100). */
  trafficSource: TrafficSplit;
  /** Share of that day's revenue per product category, in percent (sums to 100). */
  categoryMix: CategoryMix;
}

export type TransactionStatus = "paid" | "pending" | "failed" | "refunded";

export type TransactionCategory =
  | "Subscription"
  | "One-time Purchase"
  | "Upgrade"
  | "Renewal"
  | "Add-on";

export type CategoryMix = Record<TransactionCategory, number>;

export interface Transaction {
  id: string;
  date: string;
  customer: string;
  category: TransactionCategory;
  amount: number;
  status: TransactionStatus;
}

/** A named numeric slice, used by the bar and donut charts. */
export interface CategoryDatum {
  name: string;
  value: number;
}

export type Role = "admin" | "viewer";

export type RangePresetId = "today" | "7d" | "30d" | "90d" | "custom";

/** Inclusive ISO date range. */
export interface DateRange {
  from: string;
  to: string;
}
