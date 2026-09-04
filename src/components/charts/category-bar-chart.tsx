"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatCurrencyCompact, formatPercent } from "@/lib/format";
import type { CategoryDatum } from "@/lib/types";
import { TooltipShell } from "./chart-tooltip";
import { BAR_MAX_THICKNESS, CHART_INK, SERIES, TICK_STYLE } from "./chart-theme";

interface BarDatum extends CategoryDatum {
  label: string;
  share: number;
}

/**
 * Revenue per product category. Nominal categories with no natural order, so
 * every bar is the same colour — colouring by size would double-encode the bar
 * length and burn the only free channel on information already on screen.
 */
export function CategoryBarChart({
  data,
  height = 260,
}: {
  data: readonly CategoryDatum[];
  height?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const rows: BarDatum[] = data.map((item) => ({
    ...item,
    label: formatCurrencyCompact(item.value),
    share: total === 0 ? 0 : (item.value / total) * 100,
  }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 68, bottom: 0, left: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            horizontal={false}
            stroke={CHART_INK.grid}
            strokeWidth={1}
          />
          <XAxis
            type="number"
            tickFormatter={formatCurrencyCompact}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={{ stroke: CHART_INK.axis, strokeWidth: 1 }}
            tickMargin={8}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            width={116}
          />
          <Tooltip
            cursor={{ fill: CHART_INK.grid }}
            content={(props) => {
              const row = props.payload?.[0]?.payload as BarDatum | undefined;
              if (!props.active || !row) return null;
              return (
                <TooltipShell
                  title={row.name}
                  rows={[
                    {
                      key: "revenue",
                      label: "Revenue",
                      value: formatCurrency(row.value),
                      color: SERIES[0],
                    },
                    {
                      key: "share",
                      label: "Share of total",
                      value: formatPercent(row.share),
                    },
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="value"
            fill={SERIES[0]}
            radius={[0, 4, 4, 0]}
            maxBarSize={BAR_MAX_THICKNESS}
          >
            <LabelList
              dataKey="label"
              position="right"
              offset={10}
              fill={CHART_INK.label}
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
