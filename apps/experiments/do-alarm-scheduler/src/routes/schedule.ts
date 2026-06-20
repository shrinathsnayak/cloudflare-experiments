import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ScheduleRecord } from "../types/env";
import { validateMessage, validateSeconds } from "../lib/schedule";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/schedule", async (c) => {
  let body: { seconds?: unknown; message?: unknown };
  try {
    body = await c.req.json<{ seconds?: unknown; message?: unknown }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const seconds = validateSeconds(body.seconds);
  const message = validateMessage(body.message);
  if (seconds === null) {
    return jsonError(c, "Invalid seconds (1-300)", "INVALID_SECONDS");
  }
  if (!message) {
    return jsonError(c, "Missing or invalid message (max 500 chars)", "INVALID_MESSAGE");
  }

  const id = crypto.randomUUID();
  const stub = c.env.SCHEDULER.get(c.env.SCHEDULER.idFromName(id));
  const response = await stub.fetch("https://scheduler/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, seconds, message }),
  });

  if (!response.ok) {
    return jsonError(c, "Failed to schedule reminder", "SCHEDULE_ERROR", 502);
  }

  const record = (await response.json()) as ScheduleRecord;
  return jsonSuccess(c, record, 201);
});

app.get("/status/:id", async (c) => {
  const id = c.req.param("id");
  if (!id.trim()) {
    return jsonError(c, "Missing schedule id", "INVALID_ID");
  }

  const stub = c.env.SCHEDULER.get(c.env.SCHEDULER.idFromName(id));
  const response = await stub.fetch("https://scheduler/status");
  if (response.status === 404) {
    return jsonError(c, "Schedule not found", "NOT_FOUND", 404);
  }
  const record = (await response.json()) as ScheduleRecord;
  return jsonSuccess(c, record);
});

export default app;
