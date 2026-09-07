import type { Page } from "@playwright/test";

/** The four routes, with something on each that only appears once it rendered. */
export const ROUTES = [
  { path: "/", name: "overview", heading: "Overview" },
  { path: "/analytics", name: "analytics", heading: "Analytics" },
  { path: "/data", name: "data", heading: "Data" },
  { path: "/settings", name: "settings", heading: "Settings" },
] as const;

export type Route = (typeof ROUTES)[number];

/**
 * The breakpoints the layout claims to support, tested at the boundary rather
 * than comfortably inside it: 1280 is the desktop floor, 768 the tablet floor,
 * 360 the narrowest phone the design targets.
 */
export const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 360, height: 740 },
] as const;

export type Theme = "light" | "dark";

/** Pin the theme before the first paint, the same way a returning user would. */
export async function pinTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript(
    ([value]) => {
      window.localStorage.setItem("theme", value as string);
    },
    [theme],
  );
}

/**
 * Navigate and wait until the page is genuinely settled: hydrated, fonts
 * resolved, and every chart or table that route owns actually drawn. Recharts
 * only renders in the browser, so a screenshot taken on `load` would catch an
 * empty box.
 */
export async function gotoSettled(page: Page, route: Route): Promise<void> {
  await page.goto(route.path, { waitUntil: "load" });
  await page.getByRole("heading", { level: 1, name: route.heading }).waitFor();

  if (route.path === "/data") {
    await page.locator("table tbody tr").first().waitFor();
  } else if (route.path !== "/settings") {
    await page.locator(".recharts-surface").first().waitFor();
  }

  await page.evaluate(() => document.fonts.ready);
  /* Recharts animates its first draw; let it finish so nothing is mid-flight. */
  await page.waitForTimeout(600);
}
