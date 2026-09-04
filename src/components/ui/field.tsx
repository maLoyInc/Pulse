"use client";

import { Search, X } from "lucide-react";
import { useId, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const FIELD_BASE =
  "h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle transition-colors";

/** Search box with an inline clear affordance. */
export function SearchField({
  value,
  onValueChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle"
          aria-hidden
        />
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          className={cn(FIELD_BASE, "pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden")}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Native date input — the OS picker is better than anything hand-rolled. */
export function DateField({
  label,
  className,
  id,
  invalid = false,
  ...props
}: ComponentPropsWithoutRef<"input"> & { label: string; invalid?: boolean }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={fieldId}
        className="mb-1 block text-xs font-medium text-fg-muted"
      >
        {label}
      </label>
      <input
        id={fieldId}
        type="date"
        aria-invalid={invalid || undefined}
        className={cn(FIELD_BASE, invalid && "border-neg")}
        {...props}
      />
    </div>
  );
}
