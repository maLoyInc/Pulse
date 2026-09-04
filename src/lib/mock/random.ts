/**
 * Deterministic pseudo-randomness. The dashboard must render the same numbers
 * on every reload (and identically on server and client), so nothing here uses
 * `Math.random()`.
 */

/** mulberry32 — small, fast, well-distributed 32-bit PRNG. */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform float in `[min, max)`. */
export function between(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

/** Uniform integer in `[min, max]`. */
export function intBetween(
  rand: () => number,
  min: number,
  max: number,
): number {
  return Math.floor(between(rand, min, max + 1));
}

export function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

/**
 * Picks from `items` using relative weights, so mock data can lean realistic
 * (mostly `paid` transactions, a few `failed`) instead of uniformly random.
 */
export function pickWeighted<T>(
  rand: () => number,
  items: readonly T[],
  weights: readonly number[],
): T {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let threshold = rand() * total;
  for (let i = 0; i < items.length; i += 1) {
    threshold -= weights[i];
    if (threshold <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Rounds a set of shares to integers that still sum to `total` exactly. */
export function normalizeToTotal(values: number[], total: number): number[] {
  const sum = values.reduce((acc, v) => acc + v, 0);
  const scaled = values.map((v) => (v / sum) * total);
  const rounded = scaled.map(Math.floor);
  let remainder = total - rounded.reduce((acc, v) => acc + v, 0);

  // Hand the leftover units to the largest fractional parts, biggest first.
  const order = scaled
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  for (const { i } of order) {
    if (remainder <= 0) break;
    rounded[i] += 1;
    remainder -= 1;
  }
  return rounded;
}
