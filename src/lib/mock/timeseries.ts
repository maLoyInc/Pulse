import type {
  CategoryMix,
  DailyMetric,
  TrafficChannel,
  TrafficSplit,
  TransactionCategory,
} from "../types";
import { addDays, toISODate } from "../date";
import { between, createRandom, normalizeToTotal } from "./random";

export const TRAFFIC_CHANNELS: readonly TrafficChannel[] = [
  "organic",
  "paid",
  "referral",
  "direct",
];

export const PRODUCT_CATEGORIES: readonly TransactionCategory[] = [
  "Subscription",
  "Renewal",
  "Upgrade",
  "One-time Purchase",
  "Add-on",
];

/** Sunday-first weekday multipliers — B2B traffic dips over the weekend. */
const WEEKDAY_FACTOR = [0.79, 1.07, 1.04, 1.0, 1.01, 1.05, 0.76];

/** Channel mix drifts across the window: organic earns share, paid loses it. */
const CHANNEL_START: TrafficSplit = { organic: 32, paid: 37, referral: 18, direct: 13 };
const CHANNEL_END: TrafficSplit = { organic: 41, paid: 29, referral: 18, direct: 12 };

const CATEGORY_START: CategoryMix = {
  Subscription: 34,
  Renewal: 19,
  Upgrade: 11,
  "One-time Purchase": 27,
  "Add-on": 9,
};

const CATEGORY_END: CategoryMix = {
  Subscription: 44,
  Renewal: 23,
  Upgrade: 14,
  "One-time Purchase": 13,
  "Add-on": 6,
};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** A smooth, bounded event bump — used for the one dip and one spike below. */
const bump = (t: number, center: number, width: number, amplitude: number) =>
  amplitude * Math.exp(-(((t - center) / width) ** 2));

function mixFor<K extends string>(
  keys: readonly K[],
  start: Record<K, number>,
  end: Record<K, number>,
  progress: number,
  rand: () => number,
): Record<K, number> {
  const raw = keys.map((key) =>
    Math.max(1, lerp(start[key], end[key], progress) * between(rand, 0.9, 1.1)),
  );
  const shares = normalizeToTotal(raw, 100);
  return keys.reduce(
    (acc, key, i) => {
      acc[key] = shares[i];
      return acc;
    },
    {} as Record<K, number>,
  );
}

/**
 * Builds `days` of daily metrics ending on `endDate` (inclusive, oldest first).
 * The shape is layered rather than random: a growth trend, a two-week wave,
 * weekday seasonality, one dip and one campaign spike, then light noise — so
 * the charts have a story instead of a flat cloud of numbers.
 */
export function buildTimeSeries(days: number, endDate: Date): DailyMetric[] {
  const rand = createRandom(20260903);
  const start = addDays(endDate, -(days - 1));
  const series: DailyMetric[] = [];

  for (let t = 0; t < days; t += 1) {
    const date = addDays(start, t);
    const progress = days > 1 ? t / (days - 1) : 1;

    const growth = 1 + 0.52 * progress;
    const wave = 1 + 0.055 * Math.sin((t / 13.5) * Math.PI);
    const weekday = WEEKDAY_FACTOR[date.getUTCDay()];
    // Events are placed relative to the end of the window so the story is the
    // same on any day this runs: two older moves that only the 90-day view
    // reaches, and a lift in the last week for the current one to be about.
    const events =
      1 +
      bump(t, days - 87, 5, -0.15) + // a soft slump ~12 weeks back
      bump(t, days - 72, 5.5, 0.17) + // a campaign spike ~10 weeks back
      bump(t, days - 4, 6, 0.16); // demand picking up over the last week
    const noise = between(rand, 0.945, 1.055);

    const users = Math.round(228 * growth * wave * weekday * events * noise);
    const orders = Math.max(1, Math.round(users * between(rand, 0.345, 0.395)));
    const aov = between(rand, 132_000, 156_000) * (1 + 0.04 * progress);
    const revenue = Math.round((orders * aov) / 1_000) * 1_000;

    series.push({
      date: toISODate(date),
      revenue,
      users,
      orders,
      trafficSource: mixFor(
        TRAFFIC_CHANNELS,
        CHANNEL_START,
        CHANNEL_END,
        progress,
        rand,
      ),
      categoryMix: mixFor(
        PRODUCT_CATEGORIES,
        CATEGORY_START,
        CATEGORY_END,
        progress,
        rand,
      ),
    });
  }

  return series;
}
