import { isWithin } from "./date";
import type {
  DateRange,
  Transaction,
  TransactionCategory,
  TransactionStatus,
} from "./types";

/**
 * Filtering, sorting and paging as pure functions over the rows.
 *
 * Keeping it here rather than inside the table component is what makes the four
 * controls compose instead of fight: search, dropdowns, sort and page are one
 * query object evaluated in a fixed order, so no control can silently discard
 * another's state — and the CSV export can ask for exactly the rows on screen.
 */

export type SortKey = "id" | "date" | "customer" | "category" | "amount";
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

/** Newest first: the row people look for is almost always a recent one. */
export const DEFAULT_SORT: SortState = { key: "date", direction: "desc" };

export type StatusFilter = TransactionStatus | "all";
export type CategoryFilter = TransactionCategory | "all";

export interface TransactionQuery {
  search: string;
  status: StatusFilter;
  category: CategoryFilter;
  range: DateRange;
  sort: SortState;
}

function matchesSearch(row: Transaction, needle: string): boolean {
  if (!needle) return true;
  return (
    row.id.toLowerCase().includes(needle) ||
    row.customer.toLowerCase().includes(needle) ||
    row.category.toLowerCase().includes(needle)
  );
}

function compare(a: Transaction, b: Transaction, key: SortKey): number {
  if (key === "amount") return a.amount - b.amount;
  if (key === "customer") return a.customer.localeCompare(b.customer, "en");
  if (key === "category") return a.category.localeCompare(b.category, "en");
  // ISO dates and TRX ids are both fixed-width, so plain string order is
  // chronological / numeric order.
  return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
}

export function sortTransactions(
  rows: readonly Transaction[],
  sort: SortState,
): Transaction[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const primary = compare(a, b, sort.key) * factor;
    // Ties break on id so equal values never shuffle between renders.
    return primary !== 0 ? primary : a.id.localeCompare(b.id, "en");
  });
}

/** The rows the user is currently looking at, before paging. */
export function selectTransactions(
  rows: readonly Transaction[],
  query: TransactionQuery,
): Transaction[] {
  const needle = query.search.trim().toLowerCase();
  const filtered = rows.filter(
    (row) =>
      isWithin(row.date, query.range) &&
      (query.status === "all" || row.status === query.status) &&
      (query.category === "all" || row.category === query.category) &&
      matchesSearch(row, needle),
  );
  return sortTransactions(filtered, query.sort);
}

export const PAGE_SIZES = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

export interface PageSlice<T> {
  rows: T[];
  /** Clamped: a filter that shrinks the result set cannot leave you stranded. */
  page: number;
  pageCount: number;
  total: number;
  /** 1-based row numbers of the slice, for "Showing 11–20 of 42". */
  firstRow: number;
  lastRow: number;
}

export function paginate<T>(
  rows: readonly T[],
  page: number,
  pageSize: number,
): PageSlice<T> {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    page: current,
    pageCount,
    total,
    firstRow: total === 0 ? 0 : start + 1,
    lastRow: Math.min(start + pageSize, total),
  };
}
