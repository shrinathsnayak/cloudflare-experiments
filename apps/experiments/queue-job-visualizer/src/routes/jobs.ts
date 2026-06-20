import { Hono } from "hono";
import type { Env } from "../types/env";
import { buildJobRecord, getJob, saveJob, validateJobType, validateTarget } from "../lib/jobs";
import { buildJobMessage } from "../lib/process";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/jobs", async (c) => {
  let body: { type?: unknown; target?: unknown };
  try {
    body = await c.req.json<{ type?: unknown; target?: unknown }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const type = validateJobType(body.type);
  const target = validateTarget(body.target);
  if (!type) {
    return jsonError(c, "Invalid job type (use resize or fetch)", "INVALID_TYPE");
  }
  if (!target) {
    return jsonError(c, "Missing or invalid target (max 500 chars)", "INVALID_TARGET");
  }

  const message = buildJobMessage(type, target);
  const record = buildJobRecord(message);
  await saveJob(c.env, record);
  await c.env.JOBS_QUEUE.send(message);

  return jsonSuccess(c, record, 201);
});

app.get("/jobs/:id", async (c) => {
  const id = c.req.param("id");
  const job = await getJob(c.env, id);
  if (!job) {
    return jsonError(c, "Job not found", "NOT_FOUND", 404);
  }
  return jsonSuccess(c, job);
});

export default app;
