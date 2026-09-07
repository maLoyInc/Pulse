import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { ROUTES, VIEWPORTS, gotoSettled, pinTheme, type Theme } from "./helpers/pages";
import { record } from "./helpers/record";
import { recordOutcomes } from "./helpers/outcome";

/**
 * Automated WCAG 2.1 A/AA audit with axe-core, on every route, in both
 * palettes, plus the two states that only exist at narrow widths or after a
 * filter (the nav drawer and the empty table).
 *
 * axe evaluates computed styles, so it is run in one engine — Chromium, the one
 * axe-core supports. Cross-engine checking is the job of `rendering.spec.ts`.
 */

/* Failed checks are recorded too, so the report cannot omit them. */
recordOutcomes("a11y");

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "axe-core is supported on Chromium; other engines are covered by the rendering suite",
  );
});

async function scan(page: Page, scope: string, theme: Theme, viewport: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  record("a11y", {
    scope,
    url: page.url(),
    theme,
    viewport,
    passCount: results.passes.length,
    incompleteCount: results.incomplete.length,
    violations: results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  });
  expect(
    results.violations,
    `${scope} (${theme}, ${viewport}) — ${results.violations
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join("; ")}`,
  ).toEqual([]);
}

const desktop = VIEWPORTS[0];
const mobile = VIEWPORTS[2];

for (const theme of ["light", "dark"] as const) {
  for (const route of ROUTES) {
    test(`${route.name} has no axe violations (${theme})`, async ({ page }) => {
      await page.setViewportSize({ width: desktop.width, height: desktop.height });
      await pinTheme(page, theme);
      await gotoSettled(page, route);
      await scan(page, route.name, theme, desktop.name);
    });
  }
}

test("navigation drawer has no axe violations", async ({ page }) => {
  await page.setViewportSize({ width: mobile.width, height: mobile.height });
  await pinTheme(page, "light");
  await gotoSettled(page, ROUTES[0]);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("dialog", { name: "Navigation" }).waitFor();
  await scan(page, "overview + nav drawer", "light", mobile.name);
});

test("empty table state has no axe violations", async ({ page }) => {
  await page.setViewportSize({ width: desktop.width, height: desktop.height });
  await pinTheme(page, "light");
  await gotoSettled(page, ROUTES[2]);
  /* `<input type="search">` exposes role `searchbox`, not `textbox`. */
  await page
    .getByRole("searchbox", { name: "Search" })
    .fill("no-such-customer-anywhere");
  await page.getByText("No data found").waitFor();
  await scan(page, "data + empty state", "light", desktop.name);
});

test("custom range validation error has no axe violations", async ({ page }) => {
  await page.setViewportSize({ width: desktop.width, height: desktop.height });
  await pinTheme(page, "light");
  await gotoSettled(page, ROUTES[0]);
  await page.getByRole("button", { name: "Custom range" }).click();
  await page.getByLabel("Start date").fill("2026-09-01");
  await page.getByLabel("End date").fill("2026-08-01");
  await page.getByRole("button", { name: "Apply range" }).click();
  /* Scoped to the app: Next renders its own `__next-route-announcer__` with
     role="alert" outside the main landmark, so an unscoped locator is strict-
     mode ambiguous. */
  await page.locator("#main-content").getByRole("alert").waitFor();
  await scan(page, "overview + range validation error", "light", desktop.name);
});

/*
 * The contrast audit does not gate the donut's series colours on 3:1, on the
 * grounds that the same figures are published as text in the same card. That is
 * only a defensible position while it stays true, so it is a test rather than a
 * footnote: if a chart card loses its Table view, this fails and the exemption
 * in qa/helpers/contrast.ts goes with it.
 */
test("every chart card publishes its figures as text", async ({ page }) => {
  await page.setViewportSize({ width: desktop.width, height: desktop.height });
  await pinTheme(page, "light");
  await gotoSettled(page, ROUTES[1]);

  const switchers = page.locator('[role="group"][aria-label$=" view"]');
  const count = await switchers.count();
  expect(count, "no chart card offered a Chart/Table switch").toBeGreaterThan(0);

  const covered: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const switcher = switchers.nth(index);
    const label = await switcher.getAttribute("aria-label");
    const title = (label ?? "").replace(/ view$/, "");

    await switcher.getByRole("button", { name: "Table" }).click();
    const table = page.getByRole("table", { name: `${title} — table view` });
    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr")).not.toHaveCount(0);
    /* "Published as text" means the numbers are really there, not just a shell. */
    await expect(table.locator("tbody")).toHaveText(/\d/);
    covered.push(title);
  }

  record("mitigation", {
    check: "chart colour is never the only encoding",
    detail: `${covered.length} chart cards on Analytics offer a Table view with the same figures as text: ${covered.join(", ")}`,
  });
});
