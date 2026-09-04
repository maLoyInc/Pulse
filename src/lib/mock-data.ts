import { todayUTC } from "./date";
import {
  PRODUCT_CATEGORIES,
  TRAFFIC_CHANNELS,
  buildTimeSeries,
} from "./mock/timeseries";
import { buildTransactions } from "./mock/transactions";

/**
 * The single source of mock data for the app. Everything is generated once at
 * module scope from a fixed seed, so every render — server or client — sees the
 * same numbers.
 *
 * The window is 180 days even though the UI only offers ranges up to 90, because
 * every metric card compares its range against the equally long window before it;
 * a 90-day range needs 180 days of history to have something to compare to.
 */
export const TIMESERIES_DAYS = 180;
export const TRANSACTIONS_COUNT = 168;
export const TRANSACTIONS_WINDOW_DAYS = 90;

const dataEnd = todayUTC();

export const timeSeries = buildTimeSeries(TIMESERIES_DAYS, dataEnd);

export const transactions = buildTransactions(
  TRANSACTIONS_COUNT,
  dataEnd,
  TRANSACTIONS_WINDOW_DAYS,
);

export const DATA_START_ISO = timeSeries[0].date;
export const DATA_END_ISO = timeSeries[timeSeries.length - 1].date;

/** Earliest date the pickers allow — the transactions table starts here. */
export const TABLE_START_ISO = transactions[0]?.date ?? DATA_START_ISO;

export { PRODUCT_CATEGORIES, TRAFFIC_CHANNELS };
