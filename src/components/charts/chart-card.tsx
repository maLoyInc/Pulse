"use client";

import { CalendarOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { ChartSkeleton } from "@/components/ui/skeleton";

export interface ChartTableView {
  columns: readonly string[];
  rows: readonly (readonly (string | number)[])[];
}

const VIEW_OPTIONS = [
  { value: "chart" as const, label: "Chart" },
  { value: "table" as const, label: "Table" },
];

/**
 * The frame every chart sits in: title, optional controls, and a table twin.
 *
 * The table view is not decoration — three light-mode series colours sit below
 * 3:1 against the card surface, so the validated palette obliges a WCAG-clean
 * equivalent. It also gives keyboard users every value without hovering.
 */
export function ChartCard({
  title,
  description,
  actions,
  table,
  isRefreshing = false,
  isEmpty = false,
  emptyTitle = "No data in this range",
  emptyDescription = "Pick a wider date range to see this chart.",
  skeletonHeight = 260,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  table?: ChartTableView;
  isRefreshing?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonHeight?: number;
  children: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const showTable = view === "table" && table;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {table ? (
            <Segmented
              label={`${title} view`}
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
            />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-3">
        {isRefreshing ? (
          <ChartSkeleton height={skeletonHeight} />
        ) : isEmpty ? (
          <EmptyState
            icon={CalendarOff}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : showTable && table ? (
          <ChartTable table={table} caption={title} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function ChartTable({
  table,
  caption,
}: {
  table: ChartTableView;
  caption: string;
}) {
  return (
    <div className="max-h-[17rem] overflow-auto rounded-lg border border-line scrollbar-thin">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption} — table view</caption>
        <thead className="sticky top-0 bg-surface-2 text-left">
          <tr>
            {table.columns.map((column, i) => (
              <th
                key={column}
                scope="col"
                className={`px-3 py-2 text-xs font-medium text-fg-muted ${
                  i === 0 ? "" : "text-right"
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-line">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-3 py-1.5 ${
                    cellIndex === 0
                      ? "text-fg-muted"
                      : "text-right font-medium text-fg"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
