import { expect, test } from "@playwright/test";
import { ROUTES, gotoSettled, pinTheme } from "./helpers/pages";
import { record } from "./helpers/record";
import { installTimingHelpers, summarise, type Sample } from "./helpers/timing";
import { recordOutcomes } from "./helpers/outcome";

/**
 * Measured interaction latency, event to painted frame, five samples each.
 *
 * The PRD's budget is 200 ms of perceived response. Two numbers here are
 * deliberately larger than their raw budget and are reported with the reason:
 * search waits out a 250 ms debounce on purpose, and a date-range change opens a
 * 220 ms skeleton window on purpose. For both, what is measured against the
 * budget is the part the user is actually waiting on.
 *
 * Chromium only: this is a timing record, and mixing engines into one median
 * would describe nothing.
 */

/* Failed checks are recorded too, so the report cannot omit them. */
recordOutcomes("interactions");

const BUDGET_MS = 200;
const REPEATS = 5;
const DEBOUNCE_MS = 250;

const SEARCH_SELECTOR = 'input[type="search"]';
const STATUS_SELECT = "select";
const PAGE_SIZE_SELECT = 'select[aria-label="Rows per page"]';
const SORT_BUTTONS = "table thead th button";
const STATUS_LINE = 'p[role="status"]';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "interaction timing is recorded in one engine so the medians mean something",
  );
  await installTimingHelpers(page);
  await pinTheme(page, "light");
});

function capture(sample: Sample) {
  record("interactions", { ...sample, budgetMs: BUDGET_MS, repeats: REPEATS });
  return sample;
}

test("table sort responds within budget", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  const times: number[] = [];
  for (let i = 0; i < REPEATS; i += 1) {
    /* Index 4 is the Amount header — the most expensive sort, numeric over the
       whole filtered set. */
    times.push(
      await page.evaluate(
        (selector) => window.__qa.clickAndPaint(selector, 4),
        SORT_BUTTONS,
      ),
    );
  }
  const sample = capture(summarise("Sort by amount (168 rows)", times));
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("status filter responds within budget", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  const values = ["paid", "pending", "failed", "refunded", "all"];
  const times: number[] = [];
  for (const value of values) {
    times.push(
      await page.evaluate(
        ([selector, v]) => window.__qa.setValueAndPaint(selector, v),
        [STATUS_SELECT, value] as const,
      ),
    );
  }
  const sample = capture(summarise("Status filter change", times));
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("rows-per-page change responds within budget", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  const values = ["25", "50", "10", "50", "25"];
  const times: number[] = [];
  for (const value of values) {
    times.push(
      await page.evaluate(
        ([selector, v]) => window.__qa.setValueAndPaint(selector, v),
        [PAGE_SIZE_SELECT, value] as const,
      ),
    );
  }
  const sample = capture(summarise("Rows per page change (up to 50 rows)", times));
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("paging responds within budget", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  const times: number[] = [];
  for (let i = 0; i < REPEATS; i += 1) {
    times.push(
      await page.evaluate(() =>
        window.__qa.clickAndPaint('button[aria-label="Next page"]'),
      ),
    );
  }
  const sample = capture(summarise("Next page", times));
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("search responds within budget once the debounce elapses", async ({ page }) => {
  await gotoSettled(page, ROUTES[2]);
  /*
   * Each term has to change the row count, because what is timed is the
   * mutation of the status line. Every id is `TRX-1xxxx`, so "trx", "trx-1" and
   * "trx-10" all match the whole table: the count never moves, the observer
   * never fires and the measurement waits out the test timeout instead. These
   * five go 168 → 41 → 70 → 21 → 63 → 13 and cover all three searched fields —
   * category, id and customer.
   */
  const terms = ["renewal", "subscription", "upgrade", "trx-102", "putri"];
  const times: number[] = [];
  for (const term of terms) {
    const total = await page.evaluate(
      ([selector, value, watch]) =>
        window.__qa.typeAndAwaitRows(selector, value, watch),
      [SEARCH_SELECTOR, term, STATUS_LINE] as const,
    );
    times.push(total - DEBOUNCE_MS);
  }
  const sample = capture(
    summarise("Search keystroke to updated rows", times, `excludes the deliberate ${DEBOUNCE_MS} ms debounce`),
  );
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("chart metric switch responds within budget", async ({ page }) => {
  await gotoSettled(page, ROUTES[1]);
  const times: number[] = [];
  for (let i = 0; i < REPEATS; i += 1) {
    times.push(
      await page.evaluate((index) =>
        window.__qa.clickAndPaint(
          '[role="group"][aria-label="Chart metric"] button',
          index,
        ),
        i % 3,
      ),
    );
  }
  const sample = capture(summarise("Trend chart metric switch", times));
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("date range change acknowledges within budget", async ({ page }) => {
  await gotoSettled(page, ROUTES[0]);
  const times: number[] = [];
  for (let i = 0; i < REPEATS; i += 1) {
    /* Alternate 7d and 90d so each click is a real change. Measured to the
       frame that shows the skeleton — the deliberate 220 ms settle after it is
       a designed loading state, not latency. */
    const index = i % 2 === 0 ? 3 : 1;
    times.push(
      await page.evaluate(
        (buttonIndex) =>
          window.__qa.clickAndAwaitSelector(
            '[role="group"][aria-label="Date range preset"] button',
            ".animate-pulse",
            buttonIndex,
          ),
        index,
      ),
    );
    await page.waitForTimeout(400);
  }
  const sample = capture(
    summarise("Date preset click to loading state", times, "the 220 ms settle window that follows is a designed skeleton, not latency"),
  );
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("theme switch responds within budget", async ({ page }) => {
  await gotoSettled(page, ROUTES[0]);
  const times: number[] = [];
  for (let i = 0; i < REPEATS; i += 1) {
    times.push(
      await page.evaluate(() =>
        window.__qa.clickAndPaint('button[aria-label^="Switch to"]'),
      ),
    );
  }
  const sample = capture(summarise("Light/dark switch", times));
  expect(sample.median).toBeLessThan(BUDGET_MS);
});

test("chart tooltip appears within budget on hover", async ({ page }) => {
  await gotoSettled(page, ROUTES[0]);
  const times: number[] = [];
  for (let i = 0; i < REPEATS; i += 1) {
    times.push(
      await page.evaluate(() =>
        window.__qa.hoverAndAwaitTooltip(".recharts-surface"),
      ),
    );
    await page.mouse.move(0, 0);
    await page.waitForTimeout(120);
  }
  const sample = capture(summarise("Trend chart hover to tooltip", times));
  expect(sample.median).toBeLessThan(BUDGET_MS);
});
