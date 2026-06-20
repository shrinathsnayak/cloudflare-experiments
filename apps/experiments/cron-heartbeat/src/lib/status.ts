import type { Env } from "../types/env";
import type { HeartbeatStatus } from "../types/status";
import { STATUS_KEYS } from "../constants/keys";

export async function getHeartbeatStatus(env: Env): Promise<HeartbeatStatus> {
  const [lastRun, lastCron, runCountRaw] = await Promise.all([
    env.STATUS.get(STATUS_KEYS.lastRun),
    env.STATUS.get(STATUS_KEYS.lastCron),
    env.STATUS.get(STATUS_KEYS.runCount),
  ]);

  return {
    lastRun,
    lastCron,
    runCount: Number.parseInt(runCountRaw ?? "0", 10),
  };
}

export async function recordHeartbeat(env: Env, cron: string): Promise<HeartbeatStatus> {
  const current = await getHeartbeatStatus(env);
  const nextCount = current.runCount + 1;
  const lastRun = new Date().toISOString();

  await Promise.all([
    env.STATUS.put(STATUS_KEYS.lastRun, lastRun),
    env.STATUS.put(STATUS_KEYS.lastCron, cron),
    env.STATUS.put(STATUS_KEYS.runCount, String(nextCount)),
  ]);

  return {
    lastRun,
    lastCron: cron,
    runCount: nextCount,
  };
}
