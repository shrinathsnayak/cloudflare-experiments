import { MAX_RECENT_EVENTS, RECENT_KEY } from "../constants/defaults";
import type { TailLogEntry } from "../types/log";

export function extractLogMessages(event: TraceItem): string[] {
  if (!event.logs || !Array.isArray(event.logs)) return [];
  return event.logs.map((log) => {
    if (typeof log.message === "string") return log.message;
    if (Array.isArray(log.message)) {
      return log.message.map((part) => String(part)).join(" ");
    }
    return String(log.message ?? "");
  });
}

export function toTailLogEntry(event: TraceItem): TailLogEntry {
  return {
    scriptName: event.scriptName ?? "unknown",
    outcome: event.outcome,
    eventTimestamp: event.eventTimestamp ?? Date.now(),
    logs: extractLogMessages(event),
  };
}

export async function readRecent(kv: KVNamespace): Promise<TailLogEntry[]> {
  const raw = await kv.get(RECENT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as TailLogEntry[];
  } catch {
    return [];
  }
}

export async function appendTailEvents(
  kv: KVNamespace,
  events: TraceItem[]
): Promise<TailLogEntry[]> {
  const existing = await readRecent(kv);
  const incoming = events.map(toTailLogEntry);
  const merged = [...incoming, ...existing].slice(0, MAX_RECENT_EVENTS);
  await kv.put(RECENT_KEY, JSON.stringify(merged));
  return merged;
}

export async function clearRecent(kv: KVNamespace): Promise<void> {
  await kv.delete(RECENT_KEY);
}
