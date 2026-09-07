import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "@playwright/test";
import { ROUTES, VIEWPORTS, gotoSettled, pinTheme } from "./helpers/pages";
import { recordOutcomes } from "./helpers/outcome";

/**
 * The visual record: every route in both palettes at desktop width, and the two
 * data-heavy routes at the tablet and phone breakpoints, where the layout
 * actually changes shape.
 *
 * These are committed, so a reviewer can see what was checked without running
 * anything.
 */

/* Failed checks are recorded too, so the report cannot omit them. */
recordOutcomes("screenshots");

const SHOTS = join(process.cwd(), "docs", "screenshots");
const [desktop, tablet, mobile] = VIEWPORTS;

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "one engine is enough for the visual record; parity is asserted in the rendering suite",
  );
  mkdirSync(SHOTS, { recursive: true });
});

for (const theme of ["light", "dark"] as const) {
  for (const route of ROUTES) {
    test(`${route.name} at desktop width, ${theme}`, async ({ page }) => {
      await page.setViewportSize({
        width: desktop.width,
        height: desktop.height,
      });
      await pinTheme(page, theme);
      await gotoSettled(page, route);
      await page.screenshot({
        path: join(SHOTS, `${route.name}-desktop-${theme}.png`),
        fullPage: true,
      });
    });
  }
}

for (const viewport of [tablet, mobile]) {
  for (const route of [ROUTES[0], ROUTES[2]]) {
    test(`${route.name} at ${viewport.name} width`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await pinTheme(page, "light");
      await gotoSettled(page, route);
      await page.screenshot({
        path: join(SHOTS, `${route.name}-${viewport.name}.png`),
        fullPage: false,
      });
    });
  }
}

test("navigation drawer at phone width", async ({ page }) => {
  await page.setViewportSize({ width: mobile.width, height: mobile.height });
  await pinTheme(page, "light");
  await gotoSettled(page, ROUTES[0]);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("dialog", { name: "Navigation" }).waitFor();
  await page.waitForTimeout(200);
  await page.screenshot({
    path: join(SHOTS, "nav-drawer-mobile.png"),
    fullPage: false,
  });
});
