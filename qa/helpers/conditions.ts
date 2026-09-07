import { cpus, freemem, totalmem } from "node:os";

/**
 * What the machine was doing while the run was measured.
 *
 * `qa/lighthouse.mjs` already records this for its own numbers, and for the
 * same reason: an interaction budget is a statement about the app, but a
 * measurement of it is a statement about the app *and the host*. A median that
 * sits just under budget on a machine at 90% CPU with no free memory is not the
 * same result as the same median on an idle one, and a reader who cannot tell
 * the two apart will go optimising the wrong thing.
 */

export interface HostConditions {
  at: string;
  phase: "start" | "end";
  cpu: string;
  threads: number;
  cpuBusyPercent: number;
  memoryFreeGb: number;
  memoryTotalGb: number;
}

function busyTimes(): { idle: number; total: number } {
  let idle = 0;
  let total = 0;
  for (const core of cpus()) {
    for (const value of Object.values(core.times)) total += value;
    idle += core.times.idle;
  }
  return { idle, total };
}

/**
 * CPU busy over `windowMs`, differenced from the kernel's own per-core
 * counters. `os.loadavg()` is always 0 on Windows, so it cannot be used here.
 */
async function cpuBusyPercent(windowMs = 500): Promise<number> {
  const first = busyTimes();
  await new Promise((resolve) => setTimeout(resolve, windowMs));
  const second = busyTimes();
  const total = second.total - first.total;
  if (total <= 0) return 0;
  return Math.round((1 - (second.idle - first.idle) / total) * 100);
}

export async function describeHost(phase: "start" | "end"): Promise<HostConditions> {
  const cores = cpus();
  return {
    at: new Date().toISOString(),
    phase,
    cpu: cores[0]?.model.trim() ?? "unknown CPU",
    threads: cores.length,
    cpuBusyPercent: await cpuBusyPercent(),
    memoryFreeGb: Number((freemem() / 1024 ** 3).toFixed(1)),
    memoryTotalGb: Number((totalmem() / 1024 ** 3).toFixed(1)),
  };
}

/** One line, the way the Lighthouse report already phrases it. */
export function describeLine(conditions: HostConditions): string {
  return (
    `${conditions.threads} threads, ${conditions.cpu}, ` +
    `${conditions.memoryFreeGb.toFixed(1)} GB of ${conditions.memoryTotalGb.toFixed(1)} GB memory free, ` +
    `CPU ${conditions.cpuBusyPercent}% busy`
  );
}
