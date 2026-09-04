"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Announced to screen readers when the visible label is too terse. */
  srLabel?: string;
}

/**
 * Mutually exclusive options as a single control. Buttons (not a custom
 * widget) so tab order, focus rings and Enter/Space all come for free; the
 * selected one carries `aria-pressed` rather than relying on colour.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-line bg-surface-2 p-0.5 scrollbar-thin",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.srLabel}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-surface text-fg shadow-sm shadow-black/5"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
