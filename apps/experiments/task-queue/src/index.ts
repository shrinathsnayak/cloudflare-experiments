import { Hono } from "hono";
import type { Env } from "./types/env";
import { incrementStat } from "./lib/stats";
import queueRoutes from "./routes/queue";

const app = new Hono<{ Bindings: Env }>();

app.route("/", queueRoutes);

app.get("/", (c) => {
  return c.json({
    name: "task-queue",
    description:
      "Reference implementation for Queues - enqueue tasks via HTTP and process them asynchronously",
    usage: {
      enqueue: 'POST /enqueue with { "message": "..." }',
      stats: "GET /stats",
    },
    cloudflareFeatures: ["Queues", "Workers KV"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      await incrementStat(env, "processed");
      message.ack();
    }
  },
};
