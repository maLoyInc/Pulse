"use client";

import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { ExportButton } from "@/components/data-table/export-button";
import { TablePagination } from "@/components/data-table/table-pagination";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDateLong } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { transactions } from "@/lib/mock-data";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  paginate,
  selectTransactions,
  type CategoryFilter,
  type PageSize,
  type SortKey,
  type SortState,
  type StatusFilter,
} from "@/lib/table";
import type { Transaction } from "@/lib/types";
import { useFilters } from "@/providers/filter-provider";

const COLUMNS: Column<Transaction, SortKey>[] = [
  {
    key: "id",
    header: "Transaction",
    sortKey: "id",
    cell: (row) => <span className="font-medium tnum">{row.id}</span>,
    className: "w-32",
  },
  {
    key: "date",
    header: "Date",
    sortKey: "date",
    cell: (row) => (
      <span className="whitespace-nowrap text-fg-muted">
        {formatDateLong(row.date)}
      </span>
    ),
    className: "w-36",
  },
  {
    key: "customer",
    header: "Customer",
    sortKey: "customer",
    cell: (row) => row.customer,
  },
  {
    key: "category",
    header: "Category",
    sortKey: "category",
    cell: (row) => <span className="text-fg-muted">{row.category}</span>,
    className: "w-44",
  },
  {
    key: "amount",
    header: "Amount",
    sortKey: "amount",
    align: "right",
    cell: (row) => (
      <span className="font-medium whitespace-nowrap tnum">
        {formatCurrency(row.amount)}
      </span>
    ),
    className: "w-40",
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
    className: "w-32",
  },
];

/**
 * The transactions table: search, two dropdowns, sortable headers and paging,
 * all reading one query object so they compose instead of overwriting each
 * other. The date column is scoped by the same global range as the charts.
 *
 * Every control that changes the result set also returns to page 1 — being left
 * on page 7 of 2 pages is the classic way these four features break each other.
 */
export function TransactionsTable() {
  const { range, isRefreshing } = useFilters();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 250);

  // The global range is not ours to intercept, so its change is detected here
  // and folded into page state during render — React's own reset pattern.
  const rangeKey = `${range.from}:${range.to}`;
  const [lastRangeKey, setLastRangeKey] = useState(rangeKey);
  if (rangeKey !== lastRangeKey) {
    setLastRangeKey(rangeKey);
    setPage(1);
  }

  const rows = useMemo(
    () =>
      selectTransactions(transactions, {
        search: debouncedSearch,
        status,
        category,
        range,
        sort,
      }),
    [debouncedSearch, status, category, range, sort],
  );

  const slice = paginate(rows, page, pageSize);
  const isFiltered =
    search !== "" || status !== "all" || category !== "all";

  const handleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : // Text reads naturally A→Z; dates and amounts are most useful largest
          // first, which is what people expect from a fresh click.
          { key, direction: key === "customer" || key === "category" ? "asc" : "desc" },
    );
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setPage(1);
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          category={category}
          onCategoryChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
          canReset={isFiltered}
          onReset={resetFilters}
          actions={<ExportButton rows={rows} />}
        />

        {isRefreshing ? (
          <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} />
        ) : slice.total === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No data found"
            description={
              isFiltered
                ? "No transaction matches your search and filters. Try clearing them."
                : "No transaction falls inside the selected date range. Try a wider range."
            }
            action={
              isFiltered ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Reset filters
                </Button>
              ) : null
            }
          />
        ) : (
          <DataTable
            caption={`Transactions, ${slice.total} matching rows`}
            columns={COLUMNS}
            rows={slice.rows}
            getRowKey={(row) => row.id}
            sort={sort}
            onSort={handleSort}
          />
        )}

        <TablePagination
          page={slice.page}
          pageCount={slice.pageCount}
          pageSize={pageSize}
          total={slice.total}
          firstRow={slice.firstRow}
          lastRow={slice.lastRow}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </CardContent>
    </Card>
  );
}
