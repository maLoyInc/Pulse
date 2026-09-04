import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The designed "nothing here" state. Every data surface uses this one component
 * so an empty chart, an empty table and an empty range all read the same.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface-2/40 text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-12",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-fg-subtle">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="max-w-sm">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
