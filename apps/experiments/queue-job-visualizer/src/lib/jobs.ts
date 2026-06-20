import type { Env, JobMessage, JobRecord, JobStatus, JobType } from "../types/env";
import { JOB_TTL_SECONDS } from "../constants/defaults";

function jobKey(id: string): string {
  return `job:${id}`;
}

export async function saveJob(env: Env, record: JobRecord): Promise<void> {
  await env.JOBS.put(jobKey(record.id), JSON.stringify(record), {
    expirationTtl: JOB_TTL_SECONDS,
  });
}

export async function getJob(env: Env, id: string): Promise<JobRecord | null> {
  const raw = await env.JOBS.get(jobKey(id));
  if (!raw) return null;
  return JSON.parse(raw) as JobRecord;
}

export async function updateJobStatus(
  env: Env,
  id: string,
  status: JobStatus,
  patch: Partial<JobRecord> = {}
): Promise<JobRecord | null> {
  const existing = await getJob(env, id);
  if (!existing) return null;
  const updated: JobRecord = {
    ...existing,
    ...patch,
    status,
    updatedAt: new Date().toISOString(),
  };
  await saveJob(env, updated);
  return updated;
}

export function buildJobRecord(message: JobMessage): JobRecord {
  return {
    id: message.id,
    type: message.type,
    target: message.target,
    status: "queued",
    attempts: 0,
    enqueuedAt: message.enqueuedAt,
    updatedAt: message.enqueuedAt,
  };
}

export function validateJobType(value: unknown): JobType | null {
  return value === "resize" || value === "fetch" ? value : null;
}

export function validateTarget(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 500) return null;
  return trimmed;
}
