import type { Metadata } from "next";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { TransactionsTable } from "@/components/data-table/transactions-table";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Data",
  description:
    "Every transaction in the selected range, with search, status and category filters, sorting, paging and CSV export.",
};

/**
 * Data: one filter row on top, one table below it. The date range is the same
 * global state the charts use, so a range picked on Overview still applies here.
 */
export default function DataPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Data"
        description="Transactions for the selected range. Search, filter, sort, and export what you see."
      />

      <DateRangeFilter />
      <TransactionsTable />
    </div>
  );
}
