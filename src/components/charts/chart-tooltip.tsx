import { cn } from "@/lib/utils";

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  /** Series colour, drawn as a short line key — never applied to the text. */
  color?: string;
}

/**
 * One tooltip shell for every chart. The value is the strong element and the
 * series name is secondary — the reader already knows the series and wants the
 * number. Identity rides a coloured line key beside the text, never the text.
 */
export function TooltipShell({
  title,
  rows,
  footer,
}: {
  title: string;
  rows: readonly TooltipRow[];
  footer?: string;
}) {
  return (
    <div className="pointer-events-none min-w-[9.5rem] rounded-lg border border-line bg-surface-3 px-3 py-2 shadow-lg shadow-black/10">
      <p className="text-[11px] font-medium text-fg-subtle">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2">
            {row.color ? (
              <span
                aria-hidden
                className="h-0.5 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            ) : null}
            <span className="flex-1 truncate text-xs text-fg-muted">
              {row.label}
            </span>
            <span className="text-xs font-semibold text-fg tnum">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
      {footer ? (
        <p className="mt-1.5 border-t border-line pt-1.5 text-[11px] text-fg-subtle">
          {footer}
        </p>
      ) : null}
    </div>
  );
}

/** Legend entry: a mark-shaped swatch plus a text label. */
export function LegendItem({
  color,
  label,
  value,
  shape = "rect",
  className,
}: {
  color: string;
  label: string;
  value?: string;
  shape?: "rect" | "line";
  className?: string;
}) {
  return (
    <li className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className={cn("shrink-0", shape === "line" ? "h-0.5 w-3.5 rounded-full" : "size-2.5 rounded-sm")}
        style={{ backgroundColor: color }}
      />
      <span className="truncate text-xs text-fg-muted">{label}</span>
      {value ? (
        <span className="ml-auto text-xs font-medium text-fg tnum">{value}</span>
      ) : null}
    </li>
  );
}
