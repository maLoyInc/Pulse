"use client";

import { ChevronDown } from "lucide-react";
import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A styled native `<select>`. Native beats a custom listbox here: keyboard
 * support, screen-reader announcement and mobile pickers all work already.
 */
export function Select({
  label,
  hideLabel = false,
  className,
  children,
  id,
  ...props
}: ComponentPropsWithoutRef<"select"> & {
  label: string;
  hideLabel?: boolean;
  children: ReactNode;
}) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={selectId}
        className={cn(
          "mb-1 block text-xs font-medium text-fg-muted",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className="h-9 w-full appearance-none rounded-lg border border-line bg-surface pr-8 pl-3 text-sm text-fg transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-subtle"
          aria-hidden
        />
      </div>
    </div>
  );
}
