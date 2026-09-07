import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { cpus, freemem, totalmem } from "node:os";
import { join } from "node:path";

/**
 * Lighthouse against the production build, several runs, median reported with
 * the spread beside it.
 *
 * The spread is not decoration. Lighthouse multiplies CPU cost by 4 to imitate
 * a mid-range phone, so on a busy or memory-starved machine it multiplies the
 * contention too and the CPU-derived figures (Total Blocking Time, Time to
 * Interactive, and the simulated LCP that depends on them) wander by seconds
 * between identical runs. A lone median hides that; best and worst do not. The
 * host's own state is recorded for the same reason.
 *
 * Each report also carries what the browser actually observed in the trace,
 * before the network simulation is applied. Those two numbers are the page's
 * own cost and barely move between runs, so they bound what the app is
 * responsible for as opposed to the emulated device.
 *
 * Plain JS on purpose: this shells out to the Lighthouse CLI and has to run
 * outside the Playwright loader, before the suite starts. It writes
 * `qa/results/lighthouse.json`, which `qa/global-setup.ts` deliberately leaves
 * alone when it clears the run's append files — so the report picks it up.
 */

const URL = process.env.QA_BASE_URL ?? `http://127.0.0.1:${process.env.QA_PORT ?? 3100}`;
const RUNS = Number(process.env.QA_LH_RUNS ?? 5);
const RESULTS = join(process.cwd(), "qa", "results");
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

/** Simulated: what Lighthouse reports after modelling the phone and the 4G link. */
const METRICS = [
  ["first-contentful-paint", "First Contentful Paint"],
  ["largest-contentful-paint", "Largest Contentful Paint"],
  ["speed-index", "Speed Index"],
  ["interactive", "Time to Interactive"],
  ["total-blocking-time", "Total Blocking Time"],
  ["cumulative-layout-shift", "Cumulative Layout Shift"],
];

/** Observed: what the trace recorded, before the network model is applied. */
const OBSERVED = [
  ["observedFirstContentfulPaint", "First Contentful Paint"],
  ["observedLargestContentfulPaint", "Largest Contentful Paint"],
  ["observedDomContentLoaded", "DOMContentLoaded"],
  ["observedLoad", "Load"],
];

const UNITLESS = new Set(["cumulative-layout-shift"]);

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/** Seconds to two decimals, unless the metric has no unit. */
function show(value, unitless) {
  return unitless ? value.toFixed(3) : `${(value / 1000).toFixed(2)} s`;
}

/**
 * Median first, then the range it came from — and nothing at all when every run
 * agreed, because "64 (best 64, worst 64)" is noise.
 *
 * Which end is "best" depends on the metric: a lower time is better, a higher
 * score is better. Label those the same way and the worst run gets published as
 * the best one, so the caller has to say which it is.
 */
function spread(values, format, { higherIsBetter = false } = {}) {
  const mid = format(median(values));
  const low = format(Math.min(...values));
  const high = format(Math.max(...values));
  if (low === high) return mid;
  const [best, worst] = higherIsBetter ? [high, low] : [low, high];
  return `${mid} · best ${best}, worst ${worst}`;
}

function host() {
  const cores = cpus();
  const free = (freemem() / 1024 ** 3).toFixed(1);
  const total = (totalmem() / 1024 ** 3).toFixed(1);
  return (
    `${cores.length} threads, ${cores[0].model.trim()}, ` +
    `${free} GB of ${total} GB memory free when the run started`
  );
}

/*
 * Pinned, and fetched on demand rather than installed: a 50 MB devDependency
 * that runs a handful of times does not belong in everyone's `npm install`.
 */
const LIGHTHOUSE = "lighthouse@13.4.1";

function runOnce(index) {
  const output = join(RESULTS, `lh-run-${index}.json`);
  /*
   * Through a shell, not execFile: on Windows `npx` is `npx.cmd`, and Node
   * refuses to execFile a .cmd. The one argument with spaces is quoted.
   */
  const command = [
    "npx --yes",
    LIGHTHOUSE,
    URL,
    "--output=json",
    `--output-path="${output}"`,
    `--only-categories=${CATEGORIES.join(",")}`,
    '--chrome-flags="--headless=new --no-sandbox"',
    "--quiet",
  ].join(" ");

  /* Nothing left over from an earlier attempt, so "the file exists" can only
     mean this run wrote it. */
  rmSync(output, { force: true });
  try {
    execSync(command, { stdio: ["ignore", "ignore", "inherit"] });
  } catch (error) {
    /*
     * chrome-launcher removes its temp profile directory after the report is
     * already on disk, and on Windows that delete loses a race with Chrome's
     * own file handles: EPERM, exit code 1, complete report. So the report
     * itself decides — a missing or partial one still throws.
     */
    if (!existsSync(output)) throw error;
    process.stderr.write(
      `  run ${index} exited non-zero cleaning up; report complete, keeping it\n`,
    );
  }

  const report = JSON.parse(readFileSync(output, "utf8"));
  rmSync(output, { force: true });
  const absent = CATEGORIES.filter(
    (category) => typeof report.categories?.[category]?.score !== "number",
  );
  if (absent.length > 0) {
    throw new Error(`run ${index} scored no ${absent.join(", ")}`);
  }
  return report;
}

mkdirSync(RESULTS, { recursive: true });

const conditions = host();
const reports = [];
for (let index = 1; index <= RUNS; index += 1) {
  process.stderr.write(`lighthouse run ${index}/${RUNS} against ${URL}\n`);
  reports.push(runOnce(index));
}

const scores = {};
for (const category of CATEGORIES) {
  const values = reports.map((report) =>
    Math.round(report.categories[category].score * 100),
  );
  scores[reports[0].categories[category].title] = spread(
    values,
    (value) => `${value} / 100`,
    { higherIsBetter: true },
  );
}

const metrics = {};
for (const [id, label] of METRICS) {
  const values = reports.map((report) => report.audits[id]?.numericValue ?? 0);
  metrics[label] = spread(values, (value) => show(value, UNITLESS.has(id)));
}

/* One item, always present: `metrics` is Lighthouse's own diagnostic audit. */
const observed = {};
for (const [key, label] of OBSERVED) {
  const values = reports.map(
    (report) => report.audits.metrics?.details?.items?.[0]?.[key] ?? 0,
  );
  observed[label] = spread(values, (value) => show(value, false));
}

/** Bytes on the wire and bytes to parse — the part a faster machine cannot fix. */
const RESOURCE_LABELS = {
  script: "JavaScript",
  stylesheet: "CSS",
  document: "HTML",
  total: "Everything",
};

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

const first = reports[0];
const summary = first.audits["resource-summary"]?.details?.items ?? [];
const weight = {};
for (const [type, label] of Object.entries(RESOURCE_LABELS)) {
  const row = summary.find((item) => item.resourceType === type);
  if (!row) continue;
  weight[label] = `${kb(row.transferSize)} over the wire, ${row.requestCount} request(s)`;
}

/* Compressed bytes are what the 4G link carries; uncompressed bytes are what
   the main thread has to parse, and that is the number that shows up as
   blocking time. Only scripts are reported both ways. */
const unpacked = (first.audits["script-treemap-data"]?.details?.nodes ?? []).reduce(
  (total, node) => total + (node.resourceBytes ?? 0),
  0,
);
if (unpacked > 0 && weight.JavaScript) {
  weight.JavaScript += `, ${kb(unpacked)} unpacked`;
}

const settings = first.configSettings;
writeFileSync(
  join(RESULTS, "lighthouse.json"),
  `${JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      url: URL,
      tool: `Lighthouse ${first.lighthouseVersion}`,
      throttling:
        `${settings.formFactor} emulation, ${settings.throttlingMethod} throttling ` +
        `(Slow 4G preset: ${settings.throttling.rttMs} ms RTT, ` +
        `${Math.round(settings.throttling.throughputKbps)} Kbps, ` +
        `${settings.throttling.cpuSlowdownMultiplier}× CPU)`,
      runs: RUNS,
      host: conditions,
      scores,
      metrics,
      observed,
      weight,
      note:
        `Median of ${RUNS} runs against the production build, with the best and worst ` +
        "run shown wherever they differed. Cumulative Layout Shift is unitless; every " +
        "other timing is seconds.",
    },
    null,
    2,
  )}\n`,
  "utf8",
);

process.stderr.write("wrote qa/results/lighthouse.json\n");
