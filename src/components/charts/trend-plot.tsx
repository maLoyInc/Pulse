"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateLong, formatDateShort, formatWeekday } from "@/lib/date";
import { METRIC_META } from "@/lib/metric-meta";
import type { TrendPoint } from "@/lib/metrics";
import type { MetricKey } from "@/lib/types";
import { TooltipShell } from "./chart-tooltip";
import {
  ACTIVE_DOT,
  AREA_FILL_OPACITY,
  CHART_INK,
  LINE_SPEC,
  SERIES,
  TICK_STYLE,
} from "./chart-theme";

/**
 * The Recharts half of `TrendChart`, in its own module so the library loads in
 * its own chunk. It fills the box its caller provides and never sizes itself —
 * the height belongs to the boundary, which is the only way the placeholder and
 * the plot are guaranteed to occupy the same space.
 */
export function TrendPlot({
  points,
  metric,
}: {
  points: readonly TrendPoint[];
  metric: MetricKey;
}) {
  const meta = METRIC_META[metric];

  // Keep roughly six date labels regardless of range length.
  const tickInterval = Math.max(0, Math.ceil(points.length / 6) - 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={points as TrendPoint[]}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} stroke={CHART_INK.grid} strokeWidth={1} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          interval={tickInterval}
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={{ stroke: CHART_INK.axis, strokeWidth: 1 }}
          tickMargin={8}
          minTickGap={8}
        />
        <YAxis
          tickFormatter={meta.compact}
          tick={TICK_STYLE}
          tickLine={false}
          axisLine={false}
          width={72}
        />
        <Tooltip
          cursor={{ stroke: CHART_INK.axis, strokeWidth: 1 }}
          content={(props) => {
            const point = props.payload?.[0]?.payload as TrendPoint | undefined;
            if (!props.active || !point) return null;
            return (
              <TooltipShell
                title={`${formatWeekday(point.date)}, ${formatDateLong(point.date)}`}
                rows={[
                  {
                    key: metric,
                    label: meta.label,
                    value: meta.full(point.value),
                    color: SERIES[0],
                  },
                ]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={SERIES[0]}
          fill={SERIES[0]}
          fillOpacity={AREA_FILL_OPACITY}
          activeDot={ACTIVE_DOT}
          dot={false}
          {...LINE_SPEC}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
