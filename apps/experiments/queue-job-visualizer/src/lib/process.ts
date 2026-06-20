import type { JobMessage, JobType } from "../types/env";

export async function simulateJob(type: JobType, target: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (type === "resize") {
    return `Resized ${target} to 800x600 (simulated)`;
  }
  return `Fetched ${target} (simulated)`;
}

export function shouldSimulateFailure(seed: string): boolean {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 100 < 35;
}

export function buildJobMessage(type: JobType, target: string): JobMessage {
  return {
    id: crypto.randomUUID(),
    type,
    target,
    enqueuedAt: new Date().toISOString(),
  };
}
