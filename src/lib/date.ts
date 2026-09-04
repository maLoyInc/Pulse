import type { DateRange } from "./types";

/**
 * Every date in Pulse is handled as a UTC calendar day. Mock data is generated
 * relative to "today", so server render and client hydration must agree on what
 * today is — UTC is the only reference both sides compute identically.
 */

const MS_PER_DAY = 86_400_000;

export function todayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function addISODays(iso: string, days: number): string {
  return toISODate(addDays(parseISODate(iso), days));
}

/** Inclusive day count between two ISO dates (`from === to` → 1). */
export function rangeLength(range: DateRange): number {
  const diff =
    (parseISODate(range.to).getTime() - parseISODate(range.from).getTime()) /
    MS_PER_DAY;
  return Math.floor(diff) + 1;
}

export function isValidRange(range: DateRange): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(range.from) &&
    /^\d{4}-\d{2}-\d{2}$/.test(range.to) &&
    parseISODate(range.from).getTime() <= parseISODate(range.to).getTime()
  );
}

/** The equally long window immediately before `range`, for delta comparisons. */
export function previousRange(range: DateRange): DateRange {
  const length = rangeLength(range);
  return {
    from: addISODays(range.from, -length),
    to: addISODays(range.from, -1),
  };
}

export function isWithin(iso: string, range: DateRange): boolean {
  return iso >= range.from && iso <= range.to;
}

/** Fixed locale + UTC so formatted output never differs between server and client. */
const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const longDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const weekday = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "UTC",
});

export function formatDateShort(iso: string): string {
  return shortDate.format(parseISODate(iso));
}

export function formatDateLong(iso: string): string {
  return longDate.format(parseISODate(iso));
}

export function formatWeekday(iso: string): string {
  return weekday.format(parseISODate(iso));
}

export function formatRangeLabel(range: DateRange): string {
  if (range.from === range.to) return formatDateLong(range.from);
  return `${formatDateShort(range.from)} – ${formatDateLong(range.to)}`;
}
