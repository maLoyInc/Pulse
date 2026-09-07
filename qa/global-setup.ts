import { describeHost } from "./helpers/conditions";
import { record, resetRecords } from "./helpers/record";

/**
 * One truncation per run, before any worker starts. Checks append from then on,
 * so this is the only place that deletes anything.
 *
 * The host's state is sampled straight afterwards, so the timing figures in the
 * report can be read against the machine that produced them.
 */
export default async function globalSetup(): Promise<void> {
  resetRecords();
  record("conditions", await describeHost("start"));
}
