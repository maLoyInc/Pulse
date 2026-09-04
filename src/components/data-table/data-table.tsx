"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T, S extends string = string> {
  /** Stable identity for React keys and column lookups. */
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Present ⇒ the header is a sort control for this key. */
  sortKey?: S;
  /** Width or wrapping hints applied to both the header and its cells. */
  className?: string;
}

export interface DataTableSort<S extends string> {
  key: S;
  direction: "asc" | "desc";
}

/**
 * The table shell: sortable headers, a sticky header row, and horizontal scroll
 * when the columns cannot fit.
 *
 * It renders rows and nothing else — no filtering, no paging. Those live in
 * `lib/table.ts` so the same result set can also be exported.
 *
 * Sorting is a real `<button>` inside the `<th>`, and the `<th>` carries
 * `aria-sort`, so a screen reader announces the current order instead of the
 * user having to infer it from an arrow.
 */
export function DataTable<T, S extends string>({
  columns,
  rows,
  getRowKey,
  caption,
  sort,
  onSort,
  minWidth = "46rem",
}: {
  columns: readonly Column<T, S>[];
  rows: readonly T[];
  getRowKey: (row: T) => string;
  caption: string;
  sort?: DataTableSort<S>;
  onSort?: (key: S) => void;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line scrollbar-thin">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr>
            {columns.map((column) => {
              const active = sort && column.sortKey === sort.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    !column.sortKey
                      ? undefined
                      : active
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                  }
                  className={cn(
                    "border-b border-line px-3 py-2.5 text-xs font-medium text-fg-muted",
                    column.align === "right" ? "text-right" : "text-left",
                    column.className,
                  )}
                >
                  {column.sortKey && onSort ? (
                    <SortButton
                      label={column.header}
                      align={column.align}
                      state={active ? sort.direction : null}
                      onClick={() => onSort(column.sortKey as S)}
                    />
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-line last:border-0 hover:bg-surface-2/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-3 py-2.5 align-middle text-fg",
                    column.align === "right" ? "text-right" : "text-left",
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortButton({
  label,
  state,
  align,
  onClick,
}: {
  label: string;
  state: "asc" | "desc" | null;
  align?: "left" | "right";
  onClick: () => void;
}) {
  const Icon = state === "asc" ? ChevronUp : state === "desc" ? ChevronDown : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group -mx-1 inline-flex w-full items-center gap-1 rounded-md px-1 py-0.5 font-medium transition-colors hover:text-fg",
        align === "right" ? "justify-end" : "justify-start",
        state && "text-fg",
      )}
    >
      {label}
      <Icon
        className={cn(
          "size-3.5 shrink-0 transition-opacity",
          state ? "text-accent opacity-100" : "opacity-40 group-hover:opacity-70",
        )}
        aria-hidden
      />
      <span className="sr-only">
        {state === "asc"
          ? ", sorted ascending"
          : state === "desc"
            ? ", sorted descending"
            : ", not sorted"}
      </span>
    </button>
  );
}
