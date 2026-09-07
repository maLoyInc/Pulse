"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber, formatPercent } from "@/lib/format";
import { TooltipShell } from "./chart-tooltip";
import { CHART_INK } from "./chart-theme";
import type { Slice } from "./traffic-donut-chart";

/**
 * The Recharts half of `TrafficDonutChart`, in its own module so the library
 * loads in its own chunk. The ring only — the centre total and the legend are
 * plain markup and stay in the eager half, so every figure this chart shows is
 * in the server-rendered HTML before Recharts arrives.
 */
export function TrafficDonutPlot({ slices }: { slices: readonly Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={slices as Slice[]}
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
  );
}
