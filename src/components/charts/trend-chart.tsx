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
 * A single metric over time. One series only — comparing revenue against user
 * counts would need a second y-scale, and a dual-axis chart invents
 * correlations that are not in the data. The metric switcher swaps the series
 * instead.
 */
export function TrendChart({
  points,
  metric,
  height = 280,
}: {
  points: readonly TrendPoint[];
  metric: MetricKey;
  height?: number;
}) {
  const meta = METRIC_META[metric];

  if (points.length === 1) return <SingleDayReadout point={points[0]} metric={metric} />;

  // Keep roughly six date labels regardless of range length.
  const tickInterval = Math.max(0, Math.ceil(points.length / 6) - 1);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points as TrendPoint[]}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke={CHART_INK.grid}
            strokeWidth={1}
          />
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
              const point = props.payload?.[0]?.payload as
                | TrendPoint
                | undefined;
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
    </div>
  );
}

/** A one-day range has no trend to draw, so the number becomes the chart. */
function SingleDayReadout({
  point,
  metric,
}: {
  point: TrendPoint;
  metric: MetricKey;
}) {
  const meta = METRIC_META[metric];
  return (
    <div className="flex flex-col items-start justify-center gap-1 rounded-lg border border-dashed border-line bg-surface-2/40 px-5 py-10">
      <p className="text-xs font-medium text-fg-muted">
        {meta.label} on {formatDateLong(point.date)}
      </p>
      <p className="text-4xl font-semibold tracking-tight text-fg">
        {meta.full(point.value)}
      </p>
      <p className="text-xs text-fg-subtle">
        A single day has no trend line — pick 7 days or more to see one.
      </p>
    </div>
  );
}
