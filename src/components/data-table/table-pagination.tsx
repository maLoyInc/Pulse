"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatNumber } from "@/lib/format";
import { PAGE_SIZES, type PageSize } from "@/lib/table";

/**
 * Result count, rows per page, and page navigation in one row.
 *
 * The count is the filtered total, not the dataset size — it is the only way to
 * tell "my filter matched nothing" apart from "the page is still loading".
 */
export function TablePagination({
  page,
  pageCount,
  pageSize,
  total,
  firstRow,
  lastRow,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageCount: number;
  pageSize: PageSize;
  total: number;
  firstRow: number;
  lastRow: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-fg-muted" role="status">
        {total === 0
          ? "No matching transactions"
          : `Showing ${formatNumber(firstRow)}–${formatNumber(lastRow)} of ${formatNumber(total)} transactions`}
      </p>

      <div className="flex items-center gap-2 sm:gap-3">
        <Select
          label="Rows per page"
          hideLabel
          value={pageSize}
          onChange={(event) =>
            onPageSizeChange(Number(event.target.value) as PageSize)
          }
          className="w-[7.5rem]"
          aria-label="Rows per page"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="min-w-[6.5rem] text-center text-xs text-fg-muted tnum">
            Page {page} of {pageCount}
          </span>
          <Button
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
