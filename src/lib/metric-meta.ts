import {
  formatCompact,
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
} from "./format";
import type { MetricKey } from "./types";

/**
 * How each metric is named and formatted. One place, so the axis, the tooltip,
 * the table view and the metric card can never disagree about a unit.
 */
export const METRIC_META: Record<
  MetricKey,
  {
    label: string;
    /** Short form for axis ticks and sparklines. */
    compact: (value: number) => string;
    /** Exact form for tooltips and table views. */
    full: (value: number) => string;
  }
> = {
  revenue: {
    label: "Revenue",
    compact: formatCurrencyCompact,
    full: formatCurrency,
  },
  users: {
    label: "Users",
    compact: formatCompact,
    full: formatNumber,
  },
  orders: {
    label: "Orders",
    compact: formatCompact,
    full: formatNumber,
  },
};

export const METRIC_OPTIONS = (
  Object.keys(METRIC_META) as MetricKey[]
).map((key) => ({ value: key, label: METRIC_META[key].label }));
