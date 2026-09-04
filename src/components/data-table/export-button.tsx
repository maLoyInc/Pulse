"use client";

import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/components/ui/badge";
import {
  downloadCsv,
  exportDateStamp,
  toCsv,
  type CsvColumn,
} from "@/lib/csv";
import { formatNumber } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { useRole } from "@/providers/role-provider";
import { useToast } from "@/providers/toast-provider";

/**
 * Headers mirror the table's columns exactly; values stay machine-readable —
 * raw ISO dates and unformatted amounts, because a spreadsheet should be able
 * to sum the column it just opened.
 */
const CSV_COLUMNS: CsvColumn<Transaction>[] = [
  { header: "Transaction ID", value: (row) => row.id },
  { header: "Date", value: (row) => row.date },
  { header: "Customer", value: (row) => row.customer },
  { header: "Category", value: (row) => row.category },
  { header: "Amount", value: (row) => row.amount },
  { header: "Status", value: (row) => STATUS_LABELS[row.status] },
];

/**
 * Export of exactly what the table is showing — the rows arrive already
 * filtered, searched and sorted, so the file matches the screen rather than the
 * whole dataset.
 *
 * Admin-only, and a Viewer sees the restriction rather than a missing button:
 * hiding it entirely would just look broken.
 */
export function ExportButton({ rows }: { rows: readonly Transaction[] }) {
  const { canExport } = useRole();
  const { toast } = useToast();

  if (!canExport) {
    return (
      <Button
        disabled
        aria-disabled
        title="Exporting is available to admins"
        aria-label="Export CSV — available to admins only"
      >
        <Lock className="size-4" aria-hidden />
        Export CSV
      </Button>
    );
  }

  const isEmpty = rows.length === 0;

  const handleExport = () => {
    const filename = `pulse-export-${exportDateStamp()}.csv`;
    downloadCsv(filename, toCsv(rows, CSV_COLUMNS));
    toast({
      tone: "success",
      title: "Export ready",
      description: `${formatNumber(rows.length)} ${
        rows.length === 1 ? "row" : "rows"
      } saved as ${filename}`,
    });
  };

  return (
    <Button
      variant="primary"
      onClick={handleExport}
      disabled={isEmpty}
      title={isEmpty ? "No rows match the current filters" : undefined}
      aria-label={
        isEmpty ? "Export CSV — no rows match the current filters" : undefined
      }
    >
      <Download className="size-4" aria-hidden />
      Export CSV
    </Button>
  );
}
