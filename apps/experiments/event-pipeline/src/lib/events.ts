import { MAX_EVENTS } from "../constants/defaults";
import type { EventObject } from "../types/events";
import type { PipelineBinding } from "../types/env";

export type ParseEventsResult =
  | { ok: true; events: EventObject[] }
  | { ok: false; code: "INVALID_BODY" | "TOO_MANY_EVENTS"; message: string };

function isPlainObject(value: unknown): value is EventObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonSerializable(value: unknown): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Accepts a single object, an array of objects, or `{ events: object[] }`.
 */
export function parseEventsBody(body: unknown): ParseEventsResult {
  if (body === null || body === undefined) {
    return {
      ok: false,
      code: "INVALID_BODY",
      message: "Body must be a JSON object, array of objects, or { events: object[] }",
    };
  }

  let raw: unknown[];

  if (Array.isArray(body)) {
    raw = body;
  } else if (isPlainObject(body)) {
    if (Array.isArray(body.events)) {
      raw = body.events;
    } else {
      raw = [body];
    }
  } else {
    return {
      ok: false,
      code: "INVALID_BODY",
      message: "Body must be a JSON object, array of objects, or { events: object[] }",
    };
  }

  if (raw.length > MAX_EVENTS) {
    return {
      ok: false,
      code: "TOO_MANY_EVENTS",
      message: `Too many events: max ${MAX_EVENTS} per request`,
    };
  }

  if (raw.length === 0) {
    return {
      ok: false,
      code: "INVALID_BODY",
      message: "At least one event object is required",
    };
  }

  const events: EventObject[] = [];
  for (const item of raw) {
    if (!isPlainObject(item)) {
      return {
        ok: false,
        code: "INVALID_BODY",
        message: "Each event must be a JSON object",
      };
    }
    if (!isJsonSerializable(item)) {
      return {
        ok: false,
        code: "INVALID_BODY",
        message: "Each event must be JSON-serializable",
      };
    }
    events.push(item);
  }

  return { ok: true, events };
}

function eventsJsonlKey(date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `events/${yyyy}-${mm}-${dd}.jsonl`;
}

/**
 * Send events via Pipelines when bound; otherwise append JSON lines to R2.
 */
export async function ingestEvents(
  events: EventObject[],
  pipeline: PipelineBinding | undefined,
  bucket: R2Bucket
): Promise<"pipeline" | "r2"> {
  if (pipeline) {
    await pipeline.send(events);
    return "pipeline";
  }

  const key = eventsJsonlKey();
  const existing = await bucket.get(key);
  const previous = existing ? await existing.text() : "";
  const lines = events.map((e) => JSON.stringify(e)).join("\n");
  const next = previous ? `${previous}\n${lines}\n` : `${lines}\n`;
  await bucket.put(key, next, {
    httpMetadata: { contentType: "application/x-ndjson" },
  });
  return "r2";
}
