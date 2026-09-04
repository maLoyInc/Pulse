"use client";

import { FilterX } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { STATUS_LABELS } from "@/components/ui/badge";
import { PRODUCT_CATEGORIES } from "@/lib/mock-data";
import type { CategoryFilter, StatusFilter } from "@/lib/table";
import type { TransactionStatus } from "@/lib/types";

const STATUSES = Object.keys(STATUS_LABELS) as TransactionStatus[];

/**
 * Search and the two dropdowns, above the table they scope — one filter row, so
 * there is never a second place to look for why the numbers changed.
 *
 * Reset only appears once something is actually filtered; a permanently visible
 * "Reset" invites the question of what it would even undo.
 */
export function TableToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  canReset,
  onReset,
  actions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  canReset: boolean;
  onReset: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <SearchField
        label="Search"
        value={search}
        onValueChange={onSearchChange}
        placeholder="Transaction ID, customer or category"
        className="lg:max-w-72 lg:flex-1"
      />

      <Select
        label="Status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
        className="sm:w-44"
      >
        <option value="all">All statuses</option>
        {STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </Select>

      <Select
        label="Category"
        value={category}
        onChange={(event) =>
          onCategoryChange(event.target.value as CategoryFilter)
        }
        className="sm:w-52"
      >
        <option value="all">All categories</option>
        {PRODUCT_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>

      <div className="flex items-center gap-2 lg:ml-auto">
        {canReset ? (
          <Button variant="ghost" size="md" onClick={onReset}>
            <FilterX className="size-4" aria-hidden />
            Reset
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
