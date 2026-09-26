import { Hono } from "hono";
import type { Env } from "../types/env";
import type { IngestResponse } from "../types/events";
import { SAMPLE_EVENT } from "../constants/defaults";
import { ingestEvents, parseEventsBody } from "../lib/events";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/events/sample", (c) => {
  return jsonSuccess(c, {
    schema: {
      type: "object",
      description: "Arbitrary JSON object; ingest via POST /events",
      example: SAMPLE_EVENT,
    },
    acceptedShapes: ["a single event object", "an array of event objects", '{ "events": [ ... ] }'],
    maxEvents: 100,
  });
});

app.post("/events", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const parsed = parseEventsBody(body);
  if (!parsed.ok) {
    return jsonError(c, parsed.message, parsed.code);
  }

  try {
    const transport = await ingestEvents(parsed.events, c.env.PIPELINE, c.env.EVENTS);
    const response: IngestResponse = {
      ok: true,
      count: parsed.events.length,
      transport,
    };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to ingest events";
    return jsonError(c, message, "PIPELINE_ERROR", 502);
  }
});

export default app;
