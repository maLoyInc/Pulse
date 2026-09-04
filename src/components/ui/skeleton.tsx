import { cn } from "@/lib/utils";

/** One shimmering placeholder block. Sized by the caller so nothing shifts. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-2", className)}
      aria-hidden
    />
  );
}

/** Metric card placeholder — matches the real card's footprint exactly. */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface p-4 sm:p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="mt-4 h-8 w-full" />
    </div>
  );
}

/** Chart placeholder — takes the plot height it replaces, so no layout jump. */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  const bars = [42, 68, 54, 80, 62, 90, 74, 58, 84, 66, 96, 72];
  return (
    <div
      className="flex flex-col justify-end gap-3"
      style={{ height }}
      aria-hidden
    >
      <div className="flex flex-1 items-end gap-2">
        {bars.map((percent, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-sm bg-surface-2"
            style={{ height: `${percent}%` }}
          />
        ))}
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}
