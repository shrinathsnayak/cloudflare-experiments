import { Hono } from "hono";
import type { Context } from "hono";
import type { Env } from "../types/env";
import type { EventRequestBody } from "../types/event";
import { ICS_FILENAME, MAX_TEXT_LENGTH } from "../constants/defaults";
import { resolveNow, resolveTimeZone, validateText } from "../lib/input";
import { createEvent } from "../lib/event";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function cfTimezone(c: Context<{ Bindings: Env }>): unknown {
  return (c.req.raw.cf as { timezone?: unknown } | undefined)?.timezone;
}

/** Validates input and runs the pipeline; returns either an error response or the result. */
async function handle(c: Context<{ Bindings: Env }>, body: EventRequestBody) {
  const text = validateText(body.text);
  if (!text) {
    return {
      error: jsonError(c, `text is required (1-${MAX_TEXT_LENGTH} characters)`, "INVALID_TEXT"),
    };
  }
  const timezone = resolveTimeZone(body.timezone, cfTimezone(c));
  if (!timezone) {
    return {
      error: jsonError(
        c,
        "timezone must be an IANA name like America/New_York",
        "INVALID_TIMEZONE"
      ),
    };
  }
  const now = resolveNow(body.now);
  if (!now) {
    return { error: jsonError(c, "now must be an ISO 8601 date-time", "INVALID_NOW") };
  }

  const result = await createEvent(c.env.AI, { text, timezone, now });
  if (!result.ok) {
    return {
      error: jsonError(c, result.message, result.code, result.code === "AI_ERROR" ? 502 : 400),
    };
  }
  return { data: result.data };
}

app.post("/event", async (c) => {
  let body: EventRequestBody;
  try {
    body = await c.req.json<EventRequestBody>();
  } catch {
    return jsonError(c, "Request body must be JSON", "INVALID_BODY");
  }
  if (!body || typeof body !== "object") {
    return jsonError(c, "Request body must be a JSON object", "INVALID_BODY");
  }

  const result = await handle(c, body);
  return result.error ?? jsonSuccess(c, result.data);
});

app.get("/event.ics", async (c) => {
  const result = await handle(c, {
    text: c.req.query("text"),
    timezone: c.req.query("timezone"),
    now: c.req.query("now"),
  });
  if (result.error) return result.error;

  return c.body(result.data.ics, 200, {
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": `attachment; filename=${ICS_FILENAME}`,
  });
});

export default app;
