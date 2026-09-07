import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import { ROUTES, VIEWPORTS, gotoSettled, pinTheme } from "./helpers/pages";
import { record } from "./helpers/record";
import { recordOutcomes } from "./helpers/outcome";

/**
 * The cross-engine suite: does every route actually draw, in every engine, at
 * every breakpoint the design claims — and does it do so without console
 * errors or an accidental horizontal scrollbar.
 *
 * Runs in Chromium, Gecko and WebKit, plus shipping Chrome and Edge.
 */

/* Failed checks are recorded too, so the report cannot omit them. */
recordOutcomes("rendering");

/** Anything React or the browser complains about, excluding network noise. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() === "error") errors.push(message.text());
  };
  page.on("console", onConsole);
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    for (const route of ROUTES) {
      test(`${route.name} renders`, async ({ page }, testInfo) => {
        const errors = collectErrors(page);
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await pinTheme(page, "light");
        await gotoSettled(page, route);

        /* The h1 is the contract every page shares. */
        await expect(
          page.getByRole("heading", { level: 1, name: route.heading }),
        ).toBeVisible();

        /* Charts must have real geometry, not a collapsed container. */
        const surfaces = page.locator(".recharts-surface");
        const chartsDrawn = await surfaces.count();
        for (let index = 0; index < chartsDrawn; index += 1) {
          const box = await surfaces.nth(index).boundingBox();
          expect(box?.width ?? 0, `chart ${index} width`).toBeGreaterThan(80);
          expect(box?.height ?? 0, `chart ${index} height`).toBeGreaterThan(40);
        }

        if (route.path === "/data") {
          await expect(page.locator("table tbody tr")).toHaveCount(10);
        }

        /* Nothing should push the document sideways; the table scrolls inside
           its own container instead. */
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        expect(
          scrollWidth,
          `${route.name} overflows horizontally at ${viewport.width}px`,
        ).toBeLessThanOrEqual(viewport.width + 1);

        /* The sidebar is permanent from the desktop breakpoint up, and behind a
           button below it. */
        const sidebar = page.getByRole("navigation", { name: "Main" });
        const menuButton = page.getByRole("button", { name: "Open navigation" });
        if (viewport.width >= 1024) {
          await expect(sidebar).toBeVisible();
          await expect(menuButton).toBeHidden();
        } else {
          await expect(menuButton).toBeVisible();
        }

        record("rendering", {
          engine: testInfo.project.name,
          route: route.name,
          viewport: viewport.name,
          chartsDrawn,
          documentScrollWidth: scrollWidth,
          viewportWidth: viewport.width,
          consoleErrors: errors,
        });
        expect(errors, `console errors on ${route.name}`).toEqual([]);
      });
    }
  });
}

test("dark theme is applied before the first paint", async ({ page }) => {
  await pinTheme(page, "dark");
  /* Read the class at the earliest possible moment in the document's life: if
     next-themes only applied it after hydration, this would be false. */
  await page.addInitScript(() => {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        (window as unknown as { __htmlClass?: string }).__htmlClass =
          document.documentElement.className;
      },
      { once: true },
    );
  });
  await gotoSettled(page, ROUTES[0]);
  const atParse = await page.evaluate(
    () => (window as unknown as { __htmlClass?: string }).__htmlClass ?? "",
  );
  expect(atParse, "html class at DOMContentLoaded").toContain("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("theme toggle flips the palette", async ({ page }) => {
  await pinTheme(page, "light");
  await gotoSettled(page, ROUTES[0]);
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("viewer role loses export and settings", async ({ page }) => {
  await pinTheme(page, "light");
  await gotoSettled(page, ROUTES[2]);
  await expect(page.getByRole("button", { name: /Export CSV/i })).toBeEnabled();

  await page
    .getByRole("group", { name: "Viewing as role" })
    .getByRole("button", { name: "Viewer" })
    .click();

  await expect(page.getByRole("button", { name: /Export CSV/i })).toBeDisabled();
  await expect(
    page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Settings" }),
  ).toHaveCount(0);
});
