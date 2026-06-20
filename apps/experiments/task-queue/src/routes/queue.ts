import { Hono } from "hono";
import type { Env } from "../types/env";
import { buildTaskMessage, validateMessage } from "../lib/message";
import { getQueueStats, incrementStat } from "../lib/stats";
import { jsonError, jsonSuccess } from "../utils/response";

const queueRoutes = new Hono<{ Bindings: Env }>();

queueRoutes.post("/enqueue", async (c) => {
  let body: { message?: unknown };
  try {
    body = await c.req.json<{ message?: unknown }>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const message = validateMessage(body.message);
  if (!message) {
    return jsonError(
      c,
      "Missing or invalid message (required string, max 500 chars)",
      "INVALID_MESSAGE"
    );
  }

  const task = buildTaskMessage(message);
  await c.env.TASK_QUEUE.send(task);
  await incrementStat(c.env, "enqueued");

  return jsonSuccess(c, {
    queued: true,
    message: task.message,
    enqueuedAt: task.enqueuedAt,
  });
});

queueRoutes.get("/stats", async (c) => {
  const stats = await getQueueStats(c.env);
  return jsonSuccess(c, stats);
});

export default queueRoutes;
