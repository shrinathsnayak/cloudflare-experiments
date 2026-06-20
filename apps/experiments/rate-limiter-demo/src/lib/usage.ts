import type { Env, UsageRecord } from "../types/env";

function usageKey(key: string): string {
  return `usage:${key}`;
}

export async function recordUsage(env: Env, key: string, allowed: boolean): Promise<UsageRecord> {
  const existingRaw = await env.USAGE.get(usageKey(key));
  const existing = existingRaw
    ? (JSON.parse(existingRaw) as UsageRecord)
    : { key, allowed: 0, blocked: 0, lastSeen: new Date().toISOString() };

  const updated: UsageRecord = {
    ...existing,
    allowed: existing.allowed + (allowed ? 1 : 0),
    blocked: existing.blocked + (allowed ? 0 : 1),
    lastSeen: new Date().toISOString(),
  };

  await env.USAGE.put(usageKey(key), JSON.stringify(updated), { expirationTtl: 3600 });
  return updated;
}

export async function getUsage(env: Env, key: string): Promise<UsageRecord | null> {
  const raw = await env.USAGE.get(usageKey(key));
  return raw ? (JSON.parse(raw) as UsageRecord) : null;
}

export function resolveClientKey(request: Request, override?: string | null): string {
  if (override?.trim()) return override.trim().slice(0, 128);
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For");
  return ip?.split(",")[0]?.trim() || "anonymous";
}

export function validateKey(input: string | undefined | null): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}
