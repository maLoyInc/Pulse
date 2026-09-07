import { expect, test } from "@playwright/test";
import {
  MINIMUM,
  PAIRS,
  contrastRatio,
  readThemeTokens,
  round,
} from "./helpers/contrast";
import { readRecords, record } from "./helpers/record";
import { recordOutcomes } from "./helpers/outcome";

/**
 * Measured WCAG AA contrast for every token pair the UI paints text or a
 * meaningful graphic with, in both palettes.
 *
 * Colour maths does not depend on the rendering engine, so this runs once.
 */

/* Failed checks are recorded too, so the report cannot omit them. */
recordOutcomes("contrast");

interface Row {
  theme: "light" | "dark";
  usage: string;
  fg: string;
  bg: string;
  fgHex: string;
  bgHex: string;
  requirement: string;
  ratio: number;
  minimum: number;
  passes: boolean;
  justification?: string;
}

const themes = readThemeTokens();

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "palette maths is engine-independent — measured once",
  );
});

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} palette`, () => {
    for (const pair of PAIRS) {
      const gated = MINIMUM[pair.requirement] > 0;
      const title = gated
        ? `${pair.usage} meets AA (${pair.requirement})`
        : `${pair.usage} is measured and explained (redundant)`;

      test(title, () => {
        const tokens = themes[theme];
        const fgHex = tokens[pair.fg];
        const bgHex = tokens[pair.bg];
        expect(fgHex, `token --${pair.fg} missing from ${theme}`).toBeTruthy();
        expect(bgHex, `token --${pair.bg} missing from ${theme}`).toBeTruthy();

        const ratio = round(contrastRatio(fgHex, bgHex));
        const minimum = MINIMUM[pair.requirement];
        record("contrast", {
          theme,
          usage: pair.usage,
          fg: pair.fg,
          bg: pair.bg,
          fgHex,
          bgHex,
          requirement: pair.requirement,
          ratio,
          minimum,
          passes: ratio >= minimum,
          justification: pair.justification,
        } satisfies Row);

        if (gated) {
          expect(
            ratio,
            `--${pair.fg} (${fgHex}) on --${pair.bg} (${bgHex}) in ${theme}`,
          ).toBeGreaterThanOrEqual(minimum);
          return;
        }

        /*
         * An ungated row is a claim that the information is available another
         * way. The claim has to be written down, and the thing it depends on is
         * asserted for real in qa/a11y.spec.ts.
         */
        expect(
          pair.justification,
          `--${pair.fg} is not gated on 3:1, so it owes a reason`,
        ).toBeTruthy();
      });
    }
  });
}

test.afterAll(({}, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  const rows = readRecords<Row>("contrast");
  const gated = rows.filter((row) => row.minimum > 0);
  const failed = gated.filter((row) => !row.passes).length;
  /* A line in the run log; the report itself is written in global teardown. */
  console.log(
    `contrast: ${rows.length} pairs measured, ${gated.length} gated on AA, ` +
      `${failed} below minimum, ${rows.length - gated.length} recorded with a reason`,
  );
});
