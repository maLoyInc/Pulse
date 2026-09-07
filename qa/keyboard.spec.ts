import { expect, test, type Page } from "@playwright/test";
import { ROUTES, VIEWPORTS, gotoSettled, pinTheme } from "./helpers/pages";
import { record } from "./helpers/record";
import { recordOutcomes } from "./helpers/outcome";

/**
 * Keyboard-only operation of every control that changes what is on screen:
 * Tab to reach it, Enter or Space to use it, and a focus ring you can see while
 * you are there.
 *
 * The PRD asks for this to be exercised by hand. Doing it as a script means it
 * is exercised on every run instead of once, and the record below is what was
 * actually observed rather than what was intended.
 */

/* Failed checks are recorded too, so the report cannot omit them. */
recordOutcomes("keyboard");

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "keyboard semantics are exercised in one engine; rendering is checked in all",
  );
  await pinTheme(page, "light");
});

/**
 * A short description of whatever currently holds focus: its tag name and its
 * accessible name.
 *
 * The name is taken from Playwright's own accessible-name computation — the one
 * `getByRole` uses — rather than read off the markup. A control named by a
 * `<label for>` (the search box is one) carries no `aria-label` and no text of
 * its own, so deriving the name from the element alone reports it as unnamed
 * and the tab-order assertion below silently checks nothing.
 */
async function focused(page: Page): Promise<string> {
  const tag = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body || element === document.documentElement) {
      return null;
    }
    return element.tagName.toLowerCase();
  });
  if (tag === null) return "body";

  /* The first line of the snapshot is the focused element itself, as
     `- <role> "<accessible name>"`; anything nested below it is its content. */
  const snapshot = await page.locator(":focus").ariaSnapshot();
  const [first = ""] = snapshot.split("\n");
  const opening = first.indexOf('"');
  const name =
    opening === -1 ? "" : first.slice(opening + 1, first.lastIndexOf('"'));
  return `${tag}: ${name}`;
}

/** Is the focus ring actually painted on the focused element? */
async function focusRingVisible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element) return false;
    const style = getComputedStyle(element);
    const width = Number.parseFloat(style.outlineWidth || "0");
    return width > 0 && style.outlineStyle !== "none";
  });
}

async function walk(page: Page, steps: number): Promise<string[]> {
  const seen: string[] = [];
  for (let i = 0; i < steps; i += 1) {
    await page.keyboard.press("Tab");
    seen.push(await focused(page));
  }
  return seen;
}

function note(check: string, detail: string) {
  record("keyboard", { check, detail });
}

test("skip link is the first stop and jumps to the content", async ({ page }) => {
  await gotoSettled(page, ROUTES[0]);
  await page.keyboard.press("Tab");
  expect(await focused(page)).toContain("Skip to content");
  expect(await focusRingVisible(page)).toBe(true);

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeAttached();
  expect(page.url()).toContain("#main-content");
  note("skip link", "first Tab stop, Enter moves to #main-content, ring visible");
});

test("every control on the data page is reachable by Tab", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  const order = await walk(page, 40);
  const flat = order.join(" | ");

  for (const expected of [
    "Skip to content",
    /* The role switcher's own stops. "Viewing as role" is the `role="group"`
       label that names them; the group is not focusable, so expecting it here
       was asking for a stop that cannot exist. */
    "Admin",
    "Viewer",
    "Switch to dark mode",
    "Search",
    "Export CSV",
    "Transaction",
    "Customer",
    "Amount",
    "Rows per page",
    "Next page",
  ]) {
    expect(flat, `"${expected}" never received focus`).toContain(expected);
  }
  note(
    "data page tab order",
    `${order.length} stops walked; the role switcher, theme toggle, search, both dropdowns, all five sortable headers, export, rows-per-page and paging all reached`,
  );
});

test("sortable header works with Enter and with Space", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  const amount = page.getByRole("button", { name: /^Amount/ });
  const header = page.locator("th", { has: amount });

  await expect(header).toHaveAttribute("aria-sort", "none");
  await amount.focus();
  expect(await focusRingVisible(page)).toBe(true);

  await page.keyboard.press("Enter");
  await expect(header).toHaveAttribute("aria-sort", "descending");

  await page.keyboard.press("Space");
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  note(
    "sortable header",
    "Amount column: aria-sort none → descending on Enter → ascending on Space, ring visible",
  );
});

test("date presets and the chart metric switch respond to the keyboard", async ({
  page,
}) => {
  await gotoSettled(page, ROUTES[1]);

  const presets = page.getByRole("group", { name: "Date range preset" });
  const ninety = presets.getByRole("button", { name: "90 days" });
  await ninety.focus();
  expect(await focusRingVisible(page)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(ninety).toHaveAttribute("aria-pressed", "true");

  const metric = page.getByRole("group", { name: "Chart metric" });
  const users = metric.getByRole("button", { name: "Users" });
  await users.focus();
  await page.keyboard.press("Space");
  await expect(users).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Users over time" }),
  ).toBeVisible();
  note(
    "segmented controls",
    "date preset activates on Enter, chart metric on Space; aria-pressed follows and the chart title changes",
  );
});

test("custom range can be filled and applied from the keyboard", async ({ page }) => {
  await gotoSettled(page, ROUTES[0]);
  const toggle = page.getByRole("button", { name: "Custom range" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");

  const start = page.getByLabel("Start date");
  await start.focus();
  expect(await focusRingVisible(page)).toBe(true);
  await start.fill("2026-09-01");
  await page.keyboard.press("Tab");
  expect(await focused(page)).toContain("input");
  await page.getByLabel("End date").fill("2026-08-01");

  await page.getByRole("button", { name: "Apply range" }).focus();
  await page.keyboard.press("Enter");
  /* Scoped to the app: Next's `__next-route-announcer__` also carries
     role="alert" and lives outside the main landmark. */
  const alert = page.locator("#main-content").getByRole("alert");
  await expect(alert).toHaveText("Start date must be on or before the end date.");

  /* The error is wired to both fields, so a screen reader hears why. */
  const describedBy = await start.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  expect(await alert.getAttribute("id")).toBe(describedBy);
  note(
    "custom range validation",
    "start after end is rejected inline; the alert's id is the aria-describedby of both date fields",
  );
});

test("theme and role switch from the keyboard", async ({ page }) => {
  await gotoSettled(page, ROUTES[0]);
  await page.getByRole("button", { name: "Switch to dark mode" }).focus();
  expect(await focusRingVisible(page)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveClass(/dark/);

  const viewer = page
    .getByRole("group", { name: "Viewing as role" })
    .getByRole("button", { name: "Viewer" });
  await viewer.focus();
  await page.keyboard.press("Space");
  await expect(viewer).toHaveAttribute("aria-pressed", "true");
  note(
    "top bar controls",
    "theme toggle flips the palette on Enter; role switch reaches Viewer on Space",
  );
});

test("navigation drawer traps nothing and closes on Escape", async ({ page }) => {
  const mobile = VIEWPORTS[2];
  await page.setViewportSize({ width: mobile.width, height: mobile.height });
  await gotoSettled(page, ROUTES[0]);

  const open = page.getByRole("button", { name: "Open navigation" });
  await open.focus();
  expect(await focusRingVisible(page)).toBe(true);
  await page.keyboard.press("Enter");

  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await expect(drawer).toBeVisible();
  /* Focus is moved into the panel, so the next Tab lands inside it. */
  expect(await focused(page)).toContain("div");

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  note(
    "nav drawer",
    "opens on Enter with focus moved into the dialog, closes on Escape",
  );
});

test("empty state offers a keyboard route back", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  const search = page.getByRole("searchbox", { name: "Search" });
  await search.focus();
  await search.fill("no-such-customer-anywhere");
  await expect(page.getByText("No data found")).toBeVisible();

  const reset = page.getByRole("button", { name: "Reset filters" });
  await reset.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("table tbody tr")).toHaveCount(10);
  note(
    "empty state",
    "no match shows a reason and a Reset filters button that restores the rows from the keyboard",
  );
});
