"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import type { CategoryDatum } from "@/lib/types";
import { LegendItem, TooltipShell } from "./chart-tooltip";
import { CHART_INK, SERIES } from "./chart-theme";

interface Slice extends CategoryDatum {
  share: number;
  color: string;
}

/**
 * Traffic split as part-to-whole. Four segments, read at a glance — a donut
 * stops working past about six, and for close values a bar is better.
 *
 * Colour follows the channel, not its current size, so a channel keeps its hue
 * when the ranking changes between ranges. Every slice is also labelled in the
 * legend, so identity never depends on colour alone.
 */
export function TrafficDonutChart({
  data,
  height = 240,
}: {
  data: readonly CategoryDatum[];
  height?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const slices: Slice[] = data.map((item, index) => ({
    ...item,
    share: total === 0 ? 0 : (item.value / total) * 100,
    color: SERIES[index % SERIES.length],
  }));

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ height, width: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke={CHART_INK.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              content={(props) => {
                const slice = props.payload?.[0]?.payload as Slice | undefined;
                if (!props.active || !slice) return null;
                return (
                  <TooltipShell
                    title={slice.name}
                    rows={[
                      {
                        key: "sessions",
                        label: "Sessions",
                        value: formatNumber(slice.value),
                        color: slice.color,
                      },
                      {
                        key: "share",
                        label: "Share",
                        value: formatPercent(slice.share),
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-fg">
            {formatCompact(total)}
          </span>
          <span className="text-[11px] text-fg-subtle">sessions</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5">
        {slices.map((slice) => (
          <LegendItem
            key={slice.name}
            color={slice.color}
            label={slice.name}
            value={`${formatPercent(slice.share)} · ${formatNumber(slice.value)}`}
          />
        ))}
      </ul>
    </div>
  );
}
