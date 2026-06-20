import type { Env } from "../types/env";
import type { QueueStats } from "../types/queue";
import { STATS_KEYS } from "../constants/defaults";

async function getCount(env: Env, key: keyof typeof STATS_KEYS): Promise<number> {
  const value = await env.STATS.get(STATS_KEYS[key]);
  return Number.parseInt(value ?? "0", 10);
}

export async function getQueueStats(env: Env): Promise<QueueStats> {
  const [enqueued, processed] = await Promise.all([
    getCount(env, "enqueued"),
    getCount(env, "processed"),
  ]);

  return { enqueued, processed };
}

export async function incrementStat(env: Env, key: keyof typeof STATS_KEYS): Promise<number> {
  const current = await getCount(env, key);
  const next = current + 1;
  await env.STATS.put(STATS_KEYS[key], String(next));
  return next;
}
