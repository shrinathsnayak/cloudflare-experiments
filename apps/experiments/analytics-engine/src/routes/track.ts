import { Hono } from "hono";
import type { Env } from "../types/env";
import type { TrackRequest, TrackResponse } from "../types/track";
import { normalizeTag, normalizeValue, validateEvent } from "../lib/event";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/track", async (c) => {
  let body: TrackRequest;
  try {
    body = await c.req.json<TrackRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const event = validateEvent(body.event);
  if (!event) {
    return jsonError(
      c,
      "Missing or invalid field: event (required non-empty string, max 100 characters)",
      "INVALID_EVENT"
    );
  }

  const value = normalizeValue(body.value);
  const tag = normalizeTag(body.tag);

  c.env.ANALYTICS.writeDataPoint({
    blobs: [event, tag],
    doubles: [value],
    indexes: [event],
  });

  const response: TrackResponse = {
    ok: true,
    event,
    value,
  };
  return jsonSuccess(c, response);
});

export default app;
