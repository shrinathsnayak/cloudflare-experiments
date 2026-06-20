import { Hono } from "hono";
import type { Env } from "./types/env";
import { recordHeartbeat } from "./lib/status";
import statusRoutes from "./routes/status";

const app = new Hono<{ Bindings: Env }>();

app.route("/", statusRoutes);

app.get("/", (c) => {
  return c.json({
    name: "cron-heartbeat",
    description:
      "Reference implementation for Cron Triggers - scheduled tasks that persist run metadata in KV",
    usage: "GET /status",
    cloudflareFeatures: ["Cron Triggers", "Workers KV"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    await recordHeartbeat(env, controller.cron);
  },
};
