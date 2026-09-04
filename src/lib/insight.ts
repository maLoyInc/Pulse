import { addISODays } from "./date";
import { DATA_END_ISO, TRAFFIC_CHANNELS } from "./mock-data";
import { percentChange, seriesInRange, sumMetrics } from "./metrics";

/**
 * Deltas below this are noise, not news — the banner stays hidden rather than
 * training people to ignore it.
 */
export const INSIGHT_THRESHOLD = 2;

export interface Insight {
  /** Stable per calculation, so a dismissal sticks for the whole session. */
  id: string;
  direction: "up" | "down";
  delta: number;
  headline: string;
  detail: string;
}

/** Users per channel over the 7 days ending at `anchor`. */
function channelUsers(anchor: string) {
  const days = seriesInRange({ from: addISODays(anchor, -6), to: anchor });
  return TRAFFIC_CHANNELS.map((channel) => ({
    channel,
    users: days.reduce(
      (acc, day) => acc + (day.users * day.trafficSource[channel]) / 100,
      0,
    ),
  }));
}

/**
 * The one automatic insight on Overview: revenue over the last 7 days against
 * the 7 before it, attributed to whichever channel moved the most in the same
 * direction. Entirely computed — nothing here is hardcoded.
 */
export function buildInsight(): Insight | null {
  const anchor = DATA_END_ISO;
  const prior = addISODays(anchor, -7);

  const current = sumMetrics(
    seriesInRange({ from: addISODays(anchor, -6), to: anchor }),
  ).revenue;
  const baseline = sumMetrics(
    seriesInRange({ from: addISODays(prior, -6), to: prior }),
  ).revenue;

  const delta = percentChange(current, baseline);
  if (delta === null || Math.abs(delta) < INSIGHT_THRESHOLD) return null;

  const direction = delta > 0 ? "up" : "down";
  const now = channelUsers(anchor);
  const before = channelUsers(prior);

  const moved = now
    .map((entry, i) => ({
      channel: entry.channel,
      change: entry.users - before[i].users,
    }))
    .sort((a, b) =>
      direction === "up" ? b.change - a.change : a.change - b.change,
    )[0];

  const channelLabel =
    moved.channel.charAt(0).toUpperCase() + moved.channel.slice(1);

  return {
    id: `insight-${anchor}-${direction}-${Math.round(delta * 10)}`,
    direction,
    delta,
    headline:
      direction === "up"
        ? `Revenue is up ${Math.abs(delta).toFixed(1)}% vs last week`
        : `Revenue is down ${Math.abs(delta).toFixed(1)}% vs last week`,
    detail:
      direction === "up"
        ? `${channelLabel} traffic grew the most — worth doubling down while it holds.`
        : `${channelLabel} traffic fell the most — check acquisition before it compounds.`,
  };
}
