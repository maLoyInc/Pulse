import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";

/**
 * Where a run leaves its evidence, and how it gets there.
 *
 * Playwright starts a fresh worker process after a failed test, which re-imports
 * the spec file and empties anything held in module scope. A suite that
 * accumulated its rows in an array and wrote them in `afterAll` would therefore
 * report only the checks that ran after the last failure — losing exactly the
 * evidence you came for. So each check appends its own line as it happens, and
 * the writers read the file back rather than trusting memory.
 */

export const RESULTS_DIR = join(process.cwd(), "qa", "results");

function pathFor(suite: string): string {
  return join(RESULTS_DIR, `${suite}.jsonl`);
}

/** Append one finished check. Safe to call from any worker, in any order. */
export function record(suite: string, entry: unknown): void {
  mkdirSync(RESULTS_DIR, { recursive: true });
  appendFileSync(pathFor(suite), `${JSON.stringify(entry)}\n`, "utf8");
}

/** Every check recorded for `suite` so far, in the order they happened. */
export function readRecords<T>(suite: string): T[] {
  const path = pathFor(suite);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
}

/**
 * Clear the append targets at the start of a run.
 *
 * Only `.jsonl` files are removed. Whole-file results that come from outside
 * Playwright — `lighthouse.json` and `payload.json` — are written in one shot
 * and have to survive, so the report can still quote them.
 */
export function resetRecords(): void {
  mkdirSync(RESULTS_DIR, { recursive: true });
  for (const file of readdirSync(RESULTS_DIR)) {
    if (file.endsWith(".jsonl")) rmSync(join(RESULTS_DIR, file), { force: true });
  }
}
