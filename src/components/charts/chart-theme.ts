/**
 * Chart colours are referenced as CSS custom properties, not resolved hex, so a
 * theme switch repaints every mark without React re-rendering the chart.
 *
 * The series order is fixed and assigned per entity — never per rank — so
 * filtering a slice out never repaints the survivors. Both the light and dark
 * steps were validated (lightness band, chroma floor, CVD separation, contrast)
 * against the real surfaces: #ffffff and #141b27.
 */
export const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
] as const;

export const CHART_INK = {
  grid: "var(--grid)",
  axis: "var(--axis)",
  tick: "var(--fg-subtle)",
  label: "var(--fg-muted)",
  surface: "var(--surface)",
} as const;

export const TICK_STYLE = {
  fill: CHART_INK.tick,
  fontSize: 11,
} as const;

/** 2px stroke, round caps — the fixed line spec. */
export const LINE_SPEC = {
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Markers carry a 2px surface ring so they stay legible where marks overlap. */
export const ACTIVE_DOT = {
  r: 4,
  strokeWidth: 2,
  stroke: CHART_INK.surface,
} as const;

export const AREA_FILL_OPACITY = 0.1;

export const BAR_MAX_THICKNESS = 22;
