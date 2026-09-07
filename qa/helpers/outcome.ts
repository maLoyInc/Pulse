import { test } from "@playwright/test";
import { record } from "./record";

/**
 * Makes a check that was attempted and failed visible to the report.
 *
 * Every other record in this harness is written by the check itself, at the end
 * of the check — which means a check that throws writes nothing at all, and the
 * report is assembled only from what survived. A suite where three of eight
 * checks died then reads as a suite of five that all passed, which is worse
 * than having no report: it is a document that overstates the run.
 *
 * So the outcome of every test is recorded whatever it was, in an `afterEach`
 * that runs even when the body threw, and the report subtracts the failures
 * from the totals it prints and names them underneath.
 */

export interface Outcome {
  suite: string;
  title: string;
  project: string;
  status: string;
  expected: string;
  durationMs: number;
  error?: string;
}

/* Playwright colours its error messages; the report is plain text. */
const ANSI = /\u001B\[[0-9;]*m/g;

function firstLines(message: string, count = 3): string {
  return message
    .replace(ANSI, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, count)
    .join(" — ");
}

/**
 * Register the recorder for the spec file that calls it, at module scope.
 * `suite` is the name the report groups the outcomes under, and matches the
 * suite the file's own `record()` calls write to.
 */
export function recordOutcomes(suite: string): void {
  test.afterEach(({}, testInfo) => {
    /*
     * The describe-qualified title, not the bare one. `rendering.spec.ts` names
     * the same check once per viewport, so keying on the bare title makes three
     * real checks look like one — and the report then reports fewer checks than
     * the run performed, which is the failure this file exists to prevent.
     * `titlePath` is `[file, ...describes, title]` — everything after the file
     * is the name, and the project is recorded separately below.
     */
    const parts = testInfo.titlePath.filter((part) => part.length > 0);
    const fileIndex = parts.findIndex((part) => part.endsWith(".spec.ts"));
    record("outcomes", {
      suite,
      title: parts.slice(fileIndex + 1).join(" > "),
      project: testInfo.project.name,
      status: testInfo.status ?? "unknown",
      expected: testInfo.expectedStatus,
      durationMs: Math.round(testInfo.duration),
      error: testInfo.error?.message
        ? firstLines(testInfo.error.message)
        : undefined,
    } satisfies Outcome);
  });
}
