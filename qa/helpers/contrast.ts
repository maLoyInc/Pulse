import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * WCAG 2.1 contrast maths, plus a reader that pulls the design tokens straight
 * out of `globals.css`.
 *
 * The tokens are read from the stylesheet rather than copied into this file, so
 * the audit can never drift away from the palette it claims to have checked.
 */

export type Rgb = readonly [number, number, number];

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function parseHex(value: string): Rgb {
  const hex = value.trim();
  if (!HEX.test(hex)) throw new Error(`Not a hex colour: ${value}`);
  const body = hex.slice(1);
  const full =
    body.length === 3
      ? body
          .split("")
          .map((char) => char + char)
          .join("")
      : body;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

/** WCAG relative luminance: sRGB channels linearised, then weighted. */
export function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as unknown as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colours, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(parseHex(a));
  const lb = relativeLuminance(parseHex(b));
  const [light, dark] = la >= lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export type TokenSet = Record<string, string>;

/** Grab the declarations inside the rule whose selector starts a line. */
function block(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const opening = new RegExp(`^${escaped}\\s*\\{`, "m").exec(css);
  if (!opening) {
    throw new Error(`Selector not found in globals.css: ${selector}`);
  }
  const open = opening.index + opening[0].length - 1;
  const close = css.indexOf("\n}", open);
  if (close === -1) {
    throw new Error(`Unterminated block for selector: ${selector}`);
  }
  return css.slice(open + 1, close);
}

function customProperties(source: string): TokenSet {
  const tokens: TokenSet = {};
  for (const [, name, value] of source.matchAll(
    /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g,
  )) {
    tokens[name] = value.toLowerCase();
  }
  return tokens;
}

/** Both palettes, keyed by token name without the leading dashes. */
export function readThemeTokens(
  cssPath = join(process.cwd(), "src", "app", "globals.css"),
): { light: TokenSet; dark: TokenSet } {
  const css = readFileSync(cssPath, "utf8");
  return {
    light: customProperties(block(css, ":root")),
    dark: customProperties(block(css, ".dark")),
  };
}

export type Requirement = "text" | "large-text" | "non-text" | "redundant";

/**
 * WCAG 2.1 AA minimums.
 *
 * `redundant` is not a WCAG level. It marks a graphic that fails the "required
 * to understand the content" test SC 1.4.11 attaches to graphical objects,
 * because the same information is published as text in the same card. Those
 * rows are still measured and still printed in the report — they are just not
 * gated, and each one has to say why. The condition they lean on is itself
 * asserted: `qa/a11y.spec.ts` fails if a chart card stops offering its Table
 * view.
 */
export const MINIMUM: Record<Requirement, number> = {
  text: 4.5,
  "large-text": 3,
  "non-text": 3,
  redundant: 0,
};

export interface Pair {
  /** What this combination is actually used for, in the UI. */
  usage: string;
  fg: string;
  bg: string;
  requirement: Requirement;
  /** Required for `redundant`: where the same information is available as text. */
  justification?: string;
}

const DONUT_ONLY =
  "only painted as donut slices, each ringed by a 2px surface stroke and named " +
  "in the text legend beside it; the same figures are in the card's Table view";

/**
 * Every token pair the UI actually paints text or a meaningful graphic with.
 * Soft tints are backgrounds only, which is why each one is paired with its
 * `-strong` ink rather than with the base colour.
 */
export const PAIRS: readonly Pair[] = [
  // Body and surface text.
  { usage: "body text on page background", fg: "fg", bg: "bg", requirement: "text" },
  { usage: "body text on card", fg: "fg", bg: "surface", requirement: "text" },
  { usage: "body text on inset surface", fg: "fg", bg: "surface-2", requirement: "text" },
  { usage: "secondary text on card", fg: "fg-muted", bg: "surface", requirement: "text" },
  { usage: "secondary text on page background", fg: "fg-muted", bg: "bg", requirement: "text" },
  { usage: "secondary text on inset surface", fg: "fg-muted", bg: "surface-2", requirement: "text" },
  { usage: "tertiary text on card", fg: "fg-subtle", bg: "surface", requirement: "text" },
  { usage: "tertiary text on page background", fg: "fg-subtle", bg: "bg", requirement: "text" },
  { usage: "table header text on header row", fg: "fg-muted", bg: "surface-2", requirement: "text" },

  // Accent: primary buttons, links, active nav.
  { usage: "primary button label", fg: "accent-fg", bg: "accent", requirement: "text" },
  { usage: "primary button label, hovered", fg: "accent-fg", bg: "accent-hover", requirement: "text" },
  { usage: "accent text on accent tint", fg: "accent-strong", bg: "accent-soft", requirement: "text" },
  { usage: "accent text on card", fg: "accent-strong", bg: "surface", requirement: "text" },

  // Status badges and deltas: tinted pill with its matching ink.
  { usage: "positive delta on card", fg: "pos-strong", bg: "surface", requirement: "text" },
  { usage: "positive badge text on tint", fg: "pos-strong", bg: "pos-soft", requirement: "text" },
  { usage: "negative delta on card", fg: "neg-strong", bg: "surface", requirement: "text" },
  { usage: "negative badge text on tint", fg: "neg-strong", bg: "neg-soft", requirement: "text" },
  { usage: "warning badge text on tint", fg: "warn-strong", bg: "warn-soft", requirement: "text" },
  { usage: "warning text on card", fg: "warn-strong", bg: "surface", requirement: "text" },
  { usage: "neutral badge text on tint", fg: "flat-strong", bg: "flat-soft", requirement: "text" },
  { usage: "neutral text on card", fg: "flat-strong", bg: "surface", requirement: "text" },

  // Non-text: focus ring, control outlines, chart marks that carry data alone.
  { usage: "focus ring against page background", fg: "accent", bg: "bg", requirement: "non-text" },
  { usage: "focus ring against card", fg: "accent", bg: "surface", requirement: "non-text" },
  { usage: "control border against card", fg: "line-strong", bg: "surface", requirement: "non-text" },
  { usage: "control border against inset surface", fg: "line-strong", bg: "surface-2", requirement: "non-text" },
  { usage: "trend line and bars against card", fg: "chart-1", bg: "surface", requirement: "non-text" },

  /*
   * Recorded, not gated. The axis baseline is a guide, not a value: the numbers
   * next to it are tick labels, which are text and held to 4.5:1 above.
   */
  {
    usage: "chart axis against card",
    fg: "axis",
    bg: "surface",
    requirement: "redundant",
    justification:
      "the X-axis baseline; its values are the tick labels, which are text at 4.5:1, " +
      "and every chart card publishes the same numbers in its Table view",
  },
  { usage: "chart series 2 against card", fg: "chart-2", bg: "surface", requirement: "redundant", justification: DONUT_ONLY },
  { usage: "chart series 3 against card", fg: "chart-3", bg: "surface", requirement: "redundant", justification: DONUT_ONLY },
  { usage: "chart series 4 against card", fg: "chart-4", bg: "surface", requirement: "redundant", justification: DONUT_ONLY },
  { usage: "chart series 5 against card", fg: "chart-5", bg: "surface", requirement: "redundant", justification: DONUT_ONLY },
  { usage: "chart series 6 against card", fg: "chart-6", bg: "surface", requirement: "redundant", justification: DONUT_ONLY },
];
