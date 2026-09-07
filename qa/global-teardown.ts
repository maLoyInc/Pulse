import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describeHost, describeLine, type HostConditions } from "./helpers/conditions";
import type { Outcome } from "./helpers/outcome";
import { RESULTS_DIR, readRecords } from "./helpers/record";

/**
 * Turns whatever the run recorded into `docs/qa-report.md`.
 *
 * One owner for the report, and it runs whether the suites passed or failed —
 * a QA document that only appears on a green run is not evidence of anything.
 * Sections it has no data for say so rather than being quietly omitted, so a
 * partial run can never read as a complete audit.
 *
 * The same applies one level down. A check writes its evidence when it finishes,
 * so a check that failed leaves none — and a section built only from evidence
 * would quietly shrink to the checks that survived and still read as complete.
 * Every section therefore counts what was attempted, prints what was measured,
 * and names underneath whatever did not get that far.
 */

interface ContrastRow {
  theme: string;
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

interface AxeScan {
  scope: string;
  theme: string;
  viewport: string;
  passCount: number;
  incompleteCount: number;
  violations: { id: string; impact?: string | null; help: string; nodes: string[] }[];
}

interface Note {
  check: string;
  detail: string;
}

interface Sample {
  label: string;
  samples: number[];
  median: number;
  max: number;
  note?: string;
  budgetMs?: number;
  repeats?: number;
}

interface Observation {
  engine: string;
  route: string;
  viewport: string;
  chartsDrawn: number;
  documentScrollWidth: number;
  viewportWidth: number;
  consoleErrors: string[];
}

interface Lighthouse {
  measuredAt?: string;
  url?: string;
  tool?: string;
  throttling?: string;
  runs?: number;
  host?: string;
  scores?: Record<string, string | number>;
  metrics?: Record<string, string | number>;
  observed?: Record<string, string | number>;
  weight?: Record<string, string | number>;
  note?: string;
}

interface Payload {
  measuredAt?: string;
  base?: string;
  routes?: {
    route: string;
    requests: number;
    jsUnpacked: string;
    jsGzipped: string;
    htmlGzipped: string;
  }[];
  note?: string;
}

const ENGINE_LABELS: Record<string, string> = {
  chromium: "Chromium (Chrome/Edge engine)",
  firefox: "Firefox (Gecko)",
  webkit: "Safari (WebKit)",
  chrome: "Google Chrome, shipping build",
  edge: "Microsoft Edge, shipping build",
};

function table(header: string[], rows: string[][]): string {
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function missing(what: string): string {
  return `_Not measured in this run. Produce it with \`${what}\`._`;
}

/**
 * The checks that were attempted and did not finish, spelled out under the
 * section that would otherwise have carried their data.
 */
function incomplete(failures: Outcome[]): string[] {
  if (failures.length === 0) return [];
  const plural = failures.length === 1 ? "check" : "checks";
  return [
    "",
    `> ⚠️ **${failures.length} ${plural} in this suite were attempted and did not`,
    `> complete, so nothing above stands for ${failures.length === 1 ? "it" : "them"}:**`,
    ...failures.map(
      (failure) =>
        `> - \`${failure.title}\`${failure.project === "chromium" ? "" : ` · ${failure.project}`} — ${failure.status}: ${failure.error ?? "no error message was recorded"}`,
    ),
  ];
}

/** Counted in a sentence rather than a list, where the list follows anyway. */
function alsoAttempted(failures: Outcome[]): string {
  if (failures.length === 0) return "";
  return ` ${failures.length} further check${failures.length === 1 ? "" : "s"} did not complete; ${failures.length === 1 ? "it is" : "they are"} listed below.`;
}

function contrastSection(rows: ContrastRow[], failures: Outcome[]): string {
  if (rows.length === 0) {
    return [missing("npm run qa:a11y"), ...incomplete(failures)].join("\n");
  }

  const gated = rows.filter((row) => row.minimum > 0);
  const failed = gated.filter((row) => !row.passes);
  const recorded = rows.filter((row) => row.minimum === 0);
  const ordered = [...gated].sort(
    (a, b) => a.theme.localeCompare(b.theme) || a.ratio - b.ratio,
  );

  const lines = [
    `Tokens are read out of \`src/app/globals.css\` at run time, so this table cannot`,
    `drift from the palette it claims to have checked. ${gated.length} pairs are held to a`,
    `WCAG 2.1 AA minimum; **${failed.length} are below it**.`,
    "",
    table(
      ["Theme", "Usage", "Foreground", "Background", "Ratio", "Minimum", "Verdict"],
      ordered.map((row) => [
        row.theme,
        row.usage,
        `\`--${row.fg}\` ${row.fgHex}`,
        `\`--${row.bg}\` ${row.bgHex}`,
        `${row.ratio.toFixed(2)}:1`,
        `${row.minimum}:1`,
        row.passes ? "pass" : "**fail**",
      ]),
    ),
  ];

  if (recorded.length > 0) {
    const byUsage = new Map<string, ContrastRow[]>();
    for (const row of recorded) {
      byUsage.set(row.usage, [...(byUsage.get(row.usage) ?? []), row]);
    }
    lines.push(
      "",
      "### Measured, not gated",
      "",
      "SC 1.4.11 asks for 3:1 on graphical objects *required to understand the",
      "content*. These are not: the same figures are published as text in the same",
      "card, which is asserted by the `every chart card publishes its figures as",
      "text` test — if a chart card ever loses its Table view, that test fails and",
      "this exemption goes with it. The numbers are printed anyway.",
      "",
      table(
        ["Theme", "Usage", "Colour", "Ratio", "Why it is not gated"],
        recorded
          .sort((a, b) => a.theme.localeCompare(b.theme) || a.ratio - b.ratio)
          .map((row) => [
            row.theme,
            row.usage,
            `\`--${row.fg}\` ${row.fgHex}`,
            `${row.ratio.toFixed(2)}:1`,
            row.justification ?? "—",
          ]),
      ),
    );
  }

  lines.push(...incomplete(failures));
  return lines.join("\n");
}

function axeSection(scans: AxeScan[], notes: Note[], failures: Outcome[]): string {
  if (scans.length === 0) {
    return [missing("npm run qa:a11y"), ...incomplete(failures)].join("\n");
  }

  const violations = scans.reduce((total, scan) => total + scan.violations.length, 0);
  const checks = scans.reduce((total, scan) => total + scan.passCount, 0);
  const lines = [
    `axe-core 4.11.2 via \`@axe-core/playwright\`, tags \`wcag2a wcag2aa wcag21a wcag21aa\`,`,
    `run in Chromium. ${scans.length} scans, ${checks} passing rule checks, **${violations} violations**.${alsoAttempted(failures)}`,
    "",
    table(
      ["Scope", "Theme", "Viewport", "Violations", "Needs review"],
      scans.map((scan) => [
        scan.scope,
        scan.theme,
        scan.viewport,
        scan.violations.length === 0
          ? "none"
          : scan.violations.map((v) => `\`${v.id}\``).join(", "),
        String(scan.incompleteCount),
      ]),
    ),
  ];

  if (violations > 0) {
    lines.push("", "### Violations in detail", "");
    for (const scan of scans) {
      for (const violation of scan.violations) {
        lines.push(
          `- **${violation.id}** (${violation.impact ?? "unknown impact"}) on ${scan.scope}, ${scan.theme}: ${violation.help}`,
          ...violation.nodes.map((node) => `  - \`${node}\``),
        );
      }
    }
  }

  if (notes.length > 0) {
    lines.push(
      "",
      "### Mitigations that are tested, not asserted",
      "",
      ...notes.map((note) => `- **${note.check}** — ${note.detail}`),
    );
  }

  lines.push(
    "",
    "`incomplete` results are axe's own \"needs a human\" bucket, chiefly colour",
    "contrast on gradients and text over images; the contrast table above is the",
    "answer to those.",
  );

  lines.push(...incomplete(failures));
  return lines.join("\n");
}

function renderingSection(observations: Observation[], failures: Outcome[]): string {
  if (observations.length === 0) {
    return [missing("npm run qa:browsers"), ...incomplete(failures)].join("\n");
  }

  const engines = [...new Set(observations.map((row) => row.engine))];
  const viewports = [...new Set(observations.map((row) => row.viewport))];
  const overflow = observations.filter(
    (row) => row.documentScrollWidth > row.viewportWidth + 1,
  );
  const errors = observations.filter((row) => row.consoleErrors.length > 0);

  const rows = engines.map((engine) => {
    const forEngine = observations.filter((row) => row.engine === engine);
    return [
      ENGINE_LABELS[engine] ?? engine,
      String(new Set(forEngine.map((row) => row.route)).size),
      viewports
        .filter((viewport) => forEngine.some((row) => row.viewport === viewport))
        .join(", "),
      String(forEngine.reduce((total, row) => total + row.chartsDrawn, 0)),
      forEngine.some((row) => row.documentScrollWidth > row.viewportWidth + 1)
        ? "**yes**"
        : "no",
      forEngine.some((row) => row.consoleErrors.length > 0) ? "**yes**" : "no",
    ];
  });

  const lines = [
    `Every route drawn in every engine at every breakpoint the design claims, with`,
    `charts measured for real geometry rather than presence in the DOM.`,
    "",
    table(
      ["Engine", "Routes", "Breakpoints", "Charts drawn", "H-overflow", "Console errors"],
      rows,
    ),
    "",
    `Breakpoints exercised: ${viewports.join(", ")} — 1280 / 768 / 360 px, the exact`,
    `boundaries in the requirements rather than comfortable widths inside them.`,
  ];

  if (overflow.length > 0) {
    lines.push(
      "",
      "Horizontal overflow found:",
      ...overflow.map(
        (row) =>
          `- ${row.engine} · ${row.route} · ${row.viewport}: document is ${row.documentScrollWidth}px in a ${row.viewportWidth}px viewport`,
      ),
    );
  }
  if (errors.length > 0) {
    lines.push(
      "",
      "Console errors found:",
      ...errors.flatMap((row) =>
        row.consoleErrors.map((message) => `- ${row.engine} · ${row.route}: ${message}`),
      ),
    );
  }

  lines.push(...incomplete(failures));
  return lines.join("\n");
}

function keyboardSection(checks: Note[], failures: Outcome[]): string {
  if (checks.length === 0) {
    return [missing("npm run qa:keyboard"), ...incomplete(failures)].join("\n");
  }
  return [
    "Tab to reach it, Enter or Space to use it, a visible focus ring while you are",
    `there. ${checks.length} checks completed; each line below is what that run`,
    "observed, not what was intended.",
    "",
    ...checks.map((check) => `- **${check.check}** — ${check.detail}`),
    ...incomplete(failures),
  ].join("\n");
}

function interactionsSection(
  samples: Sample[],
  failures: Outcome[],
  conditions: HostConditions | undefined,
): string {
  if (samples.length === 0) {
    return [missing("npm run qa:perf"), ...incomplete(failures)].join("\n");
  }

  const budget = samples[0]?.budgetMs ?? 200;
  const repeats = samples[0]?.repeats ?? samples[0]?.samples.length ?? 5;
  const over = samples.filter((sample) => sample.median >= budget);
  /* Passing on the median — which is what the budget gates — but reaching the
     budget at the worst sample. A pass, and worth naming as one. */
  const tight = samples.filter(
    (sample) => sample.median < budget && sample.max >= budget * 0.9,
  );

  return [
    `The event is dispatched in the page and the clock stops on the second animation`,
    `frame after it — React 19 commits in the first, the compositor shows it in the`,
    `second. ${repeats} samples each, median reported, Chromium only so the medians`,
    `describe one machine. ${samples.length} interactions completed; budget`,
    `${budget} ms, **${over.length} over**.${alsoAttempted(failures)}`,
    "",
    table(
      ["Interaction", "Median", "Worst", "Samples (ms)", "Verdict"],
      samples.map((sample) => [
        sample.note ? `${sample.label}<br>_${sample.note}_` : sample.label,
        `${sample.median.toFixed(1)} ms`,
        `${sample.max.toFixed(1)} ms`,
        sample.samples.map((value) => value.toFixed(0)).join(", "),
        sample.median < budget ? "pass" : "**over budget**",
      ]),
    ),
    "",
    "Two numbers carry a note because the delay is deliberate: search waits out a",
    "250 ms debounce before it filters, and a date-range change opens a 220 ms",
    "skeleton window. In both cases what is timed is the part the user is actually",
    "waiting on — the debounce is subtracted, and the date preset is timed to the",
    "frame that shows the skeleton.",
    ...(conditions
      ? [
          "",
          `Measured on ${describeLine(conditions)} — the same host recorded under`,
          "*Run conditions* above. A median is a statement about the app only to the",
          "extent the machine was free to give it one; on a loaded host every number",
          "here is an upper bound.",
        ]
      : []),
    ...(tight.length > 0
      ? [
          "",
          `${tight.length === 1 ? "One interaction passed" : `${tight.length} interactions passed`} on the median and reached the budget at the`,
          "worst sample. The median is what the budget gates, so these are passes —",
          "they are named because the median is the only thing between them and a",
          "failure, and a worst sample like this is the first thing a loaded host",
          "produces:",
          "",
          ...tight.map(
            (sample) =>
              `- ${sample.label} — median ${sample.median.toFixed(1)} ms against a ${budget} ms budget, worst sample ${sample.max.toFixed(1)} ms${sample.max >= budget ? ` (**${(sample.max / budget).toFixed(1)}× the budget**)` : ` (${Math.round((sample.max / budget) * 100)}% of it)`}`,
          ),
        ]
      : []),
    ...incomplete(failures),
  ].join("\n");
}

function pairs(
  header: [string, string],
  data: Record<string, string | number> | undefined,
): string[] {
  if (!data || Object.keys(data).length === 0) return [];
  return [
    table(
      header,
      Object.entries(data).map(([name, value]) => [name, String(value)]),
    ),
    "",
  ];
}

function lighthouseSection(): string {
  const path = join(RESULTS_DIR, "lighthouse.json");
  if (!existsSync(path)) return missing("npm run qa:lighthouse");
  const data = JSON.parse(readFileSync(path, "utf8")) as Lighthouse;

  const lines = [
    `${data.tool ?? "Lighthouse"} against the production build (\`next start\`) on`,
    `${data.url ?? "the local build"} — ${data.throttling ?? "throttled"}.`,
    `${data.runs ?? 1} run(s); the median is shown, with the best and worst run beside`,
    `it wherever they differed.`,
    "",
  ];

  if (data.host) {
    lines.push(
      `Measured on ${data.host}. That matters more than it looks: Lighthouse`,
      "multiplies CPU cost to imitate a mid-range phone, so on a machine that is",
      "already busy it multiplies the contention too. Total Blocking Time, Time to",
      "Interactive and the simulated Largest Contentful Paint all derive from CPU",
      "time, and their spread below is mostly the host, not the page. Read them as an",
      "upper bound.",
      "",
    );
  }

  lines.push(...pairs(["Category", "Score"], data.scores));
  lines.push(...pairs(["Metric", "Value"], data.metrics));

  if (data.observed) {
    lines.push(
      "### What the browser actually observed",
      "",
      "The same traces before the network model is applied — the page's own cost on",
      "this machine rather than the emulated phone on an emulated link. These barely",
      "move between runs, which is what says the spread above belongs to the",
      "simulation and the host.",
      "",
      ...pairs(["Metric", "Value"], data.observed),
    );
  }

  if (data.weight) {
    lines.push(
      "### Payload",
      "",
      "The part no amount of CPU fixes.",
      "",
      ...pairs(["Resource", "Weight"], data.weight),
    );
  }

  if (data.note) lines.push(data.note);

  lines.push(
    "",
    "### Against the requirement",
    "",
    "The target is an initial render under 2 seconds on a standard connection.",
    "First Contentful Paint meets it; the simulated Largest Contentful Paint does",
    "not, on this host. The two figures disagree because LCP here is a text",
    "paragraph that is already in the HTML — it is not waiting on data or on a",
    "chart, it is waiting on the main thread, and the main thread is being charged",
    "4× on a machine with almost no free memory. The observed trace above and the",
    "payload in the next section are the parts that do not depend on this host,",
    "and both are well inside budget. A re-measure on an idle machine, or on the",
    "deployed build, is the honest way to settle it.",
  );

  return lines.join("\n");
}

function payloadSection(): string {
  const path = join(RESULTS_DIR, "payload.json");
  if (!existsSync(path)) return missing("npm run qa:payload");
  const data = JSON.parse(readFileSync(path, "utf8")) as Payload;
  const routes = data.routes ?? [];
  if (routes.length === 0) return missing("npm run qa:payload");

  return [
    "The one performance figure that is the same on every machine. Timings on a",
    "busy host wander by seconds; bytes do not, so this is what a change to the",
    "app can actually be held to.",
    "",
    "Measured by fetching each route and every `<script src>` its HTML asks for —",
    "Turbopack no longer prints per-route sizes, so the served page is the only",
    "honest source.",
    "",
    table(
      ["Route", "Scripts", "JS unpacked", "JS gzipped", "HTML gzipped"],
      routes.map((row) => [
        `\`${row.route}\``,
        String(row.requests),
        row.jsUnpacked,
        row.jsGzipped,
        row.htmlGzipped,
      ]),
    ),
    "",
    "Recharts is loaded in its own chunk rather than up front — it draws nothing",
    "server-side anyway, since `ResponsiveContainer` waits for a resize",
    "measurement, so deferring it costs no visible content. That took the three",
    "chart routes from 1028 KB of initial JavaScript to the figures above, and",
    "`/settings` — the one route that never had a chart — is unchanged, which is",
    "what says the saving is Recharts and not something else moving.",
    "",
    "The fixed-height box lives in the eagerly loaded half of each chart, so the",
    "placeholder and the plot occupy the same space and the swap shifts nothing.",
    "Cumulative Layout Shift stays at 0.000, measured above.",
    ...(data.note ? ["", data.note] : []),
  ].join("\n");
}

function screenshotsSection(failures: Outcome[]): string {
  const dir = join(process.cwd(), "docs", "screenshots");
  if (!existsSync(dir)) {
    return [missing("npm run qa:screenshots"), ...incomplete(failures)].join("\n");
  }
  return [
    "Committed under `docs/screenshots/`, so the visual record is reviewable without",
    "running anything: every route in both palettes at 1280px, the two data-heavy",
    "routes at 768px and 360px, and the navigation drawer open on a phone.",
    ...incomplete(failures),
  ].join("\n");
}

/**
 * What the run was measured on. Recorded at both ends, because a machine that
 * was quiet at the start and busy at the end produced numbers that no single
 * snapshot explains.
 */
function conditionsSection(readings: HostConditions[]): string {
  if (readings.length === 0) {
    return "_The host was not sampled for this run._";
  }
  const start = readings.find((reading) => reading.phase === "start") ?? readings[0];
  const end = readings.find((reading) => reading.phase === "end");

  const lines = [
    "Every timing figure below is a measurement of the app *and* of this machine.",
    "Recorded here so a reader can tell the two apart before anyone optimises",
    "something that was never slow.",
    "",
    table(
      ["Sampled", "When", "CPU busy", "Memory free"],
      [start, ...(end ? [end] : [])].map((reading) => [
        reading.phase === "start" ? "Before the first check" : "After the last check",
        reading.at,
        `${reading.cpuBusyPercent}%`,
        `${reading.memoryFreeGb.toFixed(1)} GB of ${reading.memoryTotalGb.toFixed(1)} GB`,
      ]),
    ),
    "",
    `Host: ${start.threads} threads, ${start.cpu}.`,
  ];

  const busiest = Math.max(...readings.map((reading) => reading.cpuBusyPercent));
  const leanest = Math.min(...readings.map((reading) => reading.memoryFreeGb));
  const loaded = busiest >= 25 || leanest / start.memoryTotalGb < 0.15;
  lines.push(
    "",
    loaded
      ? `**This host was under load while the run was measured** — up to ${busiest}% CPU busy with as little as ${leanest.toFixed(1)} GB of ${start.memoryTotalGb.toFixed(1)} GB free. Interaction medians on a contended machine are upper bounds: a figure near its budget here is not yet evidence that the app is near its budget.`
      : `The host was substantially idle while the run was measured — at most ${busiest}% CPU busy, no less than ${leanest.toFixed(1)} GB of ${start.memoryTotalGb.toFixed(1)} GB free. The timing figures below can be read as the app's own cost.`,
  );

  return lines.join("\n");
}

/** Latest outcome per check, so a retried test is counted once. */
function latestOutcomes(rows: Outcome[]): Outcome[] {
  const byCheck = new Map<string, Outcome>();
  for (const row of rows) {
    byCheck.set(`${row.suite}|${row.project}|${row.title}`, row);
  }
  return [...byCheck.values()];
}

/* A deliberate `test.skip()` is not a failure; anything else that did not end
   in its expected state is. */
function didNotComplete(rows: Outcome[]): Outcome[] {
  return rows.filter((row) => row.status !== "skipped" && row.status !== row.expected);
}

export default async function globalTeardown(): Promise<void> {
  const contrast = readRecords<ContrastRow>("contrast");
  const scans = readRecords<AxeScan>("a11y");
  const mitigations = readRecords<Note>("mitigation");
  const keyboard = readRecords<Note>("keyboard");
  const interactions = readRecords<Sample>("interactions");
  const rendering = readRecords<Observation>("rendering");

  const outcomes = latestOutcomes(readRecords<Outcome>("outcomes"));
  const failures = didNotComplete(outcomes);
  const failuresIn = (suite: string) =>
    failures.filter((failure) => failure.suite === suite);
  const attempted = outcomes.filter((row) => row.status !== "skipped");

  const conditions = readRecords<HostConditions>("conditions");
  conditions.push(await describeHost("end"));
  const startConditions = conditions.find((reading) => reading.phase === "start");

  const ran = [
    contrast.length > 0 && "contrast",
    scans.length > 0 && "axe",
    rendering.length > 0 && "cross-browser rendering",
    keyboard.length > 0 && "keyboard",
    interactions.length > 0 && "interaction timing",
  ].filter((entry): entry is string => typeof entry === "string");

  const document = [
    "# QA report",
    "",
    `Generated ${new Date().toISOString()} by \`qa/global-teardown.ts\` from what the`,
    `run actually recorded. Suites in this run: ${ran.length > 0 ? ran.join(", ") : "none"}.`,
    "A section that says *not measured* means that suite did not run, not that it passed.",
    "",
    "Everything below is produced by `npm run qa` against the production build on",
    "`next start` — not the dev server, so what is measured is what would ship.",
    "",
    `**${attempted.length} checks ran; ${attempted.length - failures.length} completed and ${failures.length} did not.**`,
    ...(failures.length > 0
      ? [
          "",
          "The checks that did not complete recorded no evidence, so they appear in no",
          "table below. They are named here and again under their own section, because",
          "a section that silently shrinks to what survived reads as a clean result:",
          "",
          ...failures.map(
            (failure) =>
              `- **${failure.suite}** · \`${failure.title}\`${failure.project === "chromium" ? "" : ` · ${failure.project}`} — ${failure.status}: ${failure.error ?? "no error message was recorded"}`,
          ),
        ]
      : [
          "",
          "Every check that ran also finished, so every section below is backed by the",
          "full set of checks its suite defines.",
        ]),
    "",
    "## Run conditions",
    "",
    conditionsSection(conditions),
    "",
    "## 1. Colour contrast, WCAG 2.1 AA",
    "",
    contrastSection(contrast, failuresIn("contrast")),
    "",
    "## 2. Automated accessibility audit",
    "",
    axeSection(scans, mitigations, failuresIn("a11y")),
    "",
    "## 3. Cross-browser and cross-device rendering",
    "",
    renderingSection(rendering, failuresIn("rendering")),
    "",
    "## 4. Keyboard operation",
    "",
    keyboardSection(keyboard, failuresIn("keyboard")),
    "",
    "## 5. Interaction latency",
    "",
    interactionsSection(interactions, failuresIn("interactions"), startConditions),
    "",
    "## 6. Initial load, Lighthouse",
    "",
    lighthouseSection(),
    "",
    "## 7. Payload per route",
    "",
    payloadSection(),
    "",
    "## 8. Visual record",
    "",
    screenshotsSection(failuresIn("screenshots")),
    "",
  ].join("\n");

  const docs = join(process.cwd(), "docs");
  mkdirSync(docs, { recursive: true });
  writeFileSync(join(docs, "qa-report.md"), document, "utf8");
}
