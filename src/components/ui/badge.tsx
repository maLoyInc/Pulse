import { CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import type { TransactionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Status always ships as icon + label, never colour alone — the same rule the
 * charts follow, so the table stays readable under colour-vision deficiency.
 */
const STATUS_STYLES: Record<
  TransactionStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    className: "bg-pos-soft text-pos-strong",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warn-soft text-warn-strong",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-neg-soft text-neg-strong",
  },
  refunded: {
    label: "Refunded",
    icon: RotateCcw,
    className: "bg-flat-soft text-flat-strong",
  },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, icon: Icon, className } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

export const STATUS_LABELS = Object.fromEntries(
  Object.entries(STATUS_STYLES).map(([key, value]) => [key, value.label]),
) as Record<TransactionStatus, string>;

export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-2 py-0.5 text-xs font-medium text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
