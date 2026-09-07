import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

/**
 * Initial JavaScript per route, measured by fetching what the HTML actually
 * asks for.
 *
 * Turbopack production builds no longer print per-route sizes and write no
 * `app-build-manifest.json`, so the only honest source is the served page: take
 * every `<script src>` in the HTML, fetch it, and add it up. Bytes are
 * deterministic in a way timings on a busy machine are not, which is what makes
 * this the one performance figure worth comparing before and after a change.
 *
 * Writes `qa/results/payload.json`, which `qa/global-setup.ts` leaves alone
 * when it clears the run's append files, so the report picks it up.
 */

const BASE = process.env.QA_BASE_URL ?? `http://127.0.0.1:${process.env.QA_PORT ?? 3100}`;
const ROUTES = ["/", "/analytics", "/data", "/settings"];
const RESULTS = join(process.cwd(), "qa", "results");

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function measure(route) {
  const response = await fetch(`${BASE}${route}`);
  if (!response.ok) throw new Error(`${route} responded ${response.status}`);
  const html = await response.text();

  const sources = [
    ...html.matchAll(/<script[^>]+src="([^"]+)"/g),
  ].map((match) => match[1]);
  const unique = [...new Set(sources)];

  let raw = 0;
  let wire = 0;
  for (const src of unique) {
    const chunk = await fetch(new URL(src, BASE));
    if (!chunk.ok) throw new Error(`${src} responded ${chunk.status}`);
    const bytes = Buffer.from(await chunk.arrayBuffer());
    raw += bytes.byteLength;
    wire += gzipSync(bytes).byteLength;
  }

  const htmlBytes = Buffer.byteLength(html);
  return {
    route,
    requests: unique.length,
    raw,
    wire,
    htmlRaw: htmlBytes,
    htmlWire: gzipSync(Buffer.from(html)).byteLength,
  };
}

const rows = [];
for (const route of ROUTES) rows.push(await measure(route));

const width = Math.max(...rows.map((row) => row.route.length));
process.stdout.write(
  `${"route".padEnd(width)}  scripts  JS unpacked   JS gzipped   HTML gzipped\n`,
);
for (const row of rows) {
  process.stdout.write(
    `${row.route.padEnd(width)}  ${String(row.requests).padStart(7)}  ` +
      `${kb(row.raw).padStart(11)}  ${kb(row.wire).padStart(11)}  ` +
      `${kb(row.htmlWire).padStart(13)}\n`,
  );
}

mkdirSync(RESULTS, { recursive: true });
writeFileSync(
  join(RESULTS, "payload.json"),
  `${JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      base: BASE,
      routes: rows.map((row) => ({
        route: row.route,
        requests: row.requests,
        jsUnpacked: kb(row.raw),
        jsGzipped: kb(row.wire),
        htmlGzipped: kb(row.htmlWire),
      })),
      note:
        "Every `<script src>` the route's HTML asks for, fetched and added up. " +
        "Gzipped is what the link carries; unpacked is what the main thread has " +
        "to parse, and that is the figure that turns into blocking time.",
    },
    null,
    2,
  )}\n`,
  "utf8",
);

process.stdout.write("\nwrote qa/results/payload.json\n");
