/**
 * Number formatting. Fixed `en-US` grouping keeps server and client output
 * identical; the currency is IDR, written with an explicit `Rp` prefix rather
 * than `Intl` currency style so grouping stays consistent with plain counts.
 */

const grouped = new Intl.NumberFormat("en-US");

const oneDecimal = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatNumber(value: number): string {
  return grouped.format(Math.round(value));
}

/** 1,284 → "1,284" · 12,900 → "12.9K" · 4,200,000 → "4.2M" */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${oneDecimal.format(value / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${oneDecimal.format(value / 1_000_000)}M`;
  if (abs >= 10_000) return `${oneDecimal.format(value / 1_000)}K`;
  return grouped.format(Math.round(value));
}

export function formatCurrency(value: number): string {
  return `Rp ${formatNumber(value)}`;
}

export function formatCurrencyCompact(value: number): string {
  return `Rp ${formatCompact(value)}`;
}

/** Signed percentage for deltas: 5.24 → "+5.2%" · -3 → "-3.0%" · 0 → "0.0%" */
export function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${oneDecimal.format(Math.abs(value))}%`;
}

export function formatPercent(value: number): string {
  return `${oneDecimal.format(value)}%`;
}

export type Direction = "up" | "down" | "flat";

/** Deltas smaller than this read as noise, not movement. */
export const FLAT_THRESHOLD = 0.05;

export function directionOf(delta: number): Direction {
  if (delta > FLAT_THRESHOLD) return "up";
  if (delta < -FLAT_THRESHOLD) return "down";
  return "flat";
}
