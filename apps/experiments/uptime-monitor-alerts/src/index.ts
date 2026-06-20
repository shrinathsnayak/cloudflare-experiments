import { Hono } from "hono";
import type { Env } from "./types/env";
import { runMonitorChecks } from "./lib/monitor";
import monitorsRoutes from "./routes/monitors";

const app = new Hono<{ Bindings: Env }>();

app.route("/", monitorsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "uptime-monitor-alerts",
    description:
      "Register URL monitors, log scheduled health checks to D1, and email alerts on up-to-down transitions",
    usage: {
      register: "POST /monitors { url, alertEmail }",
      remove: "DELETE /monitors/:id",
      history: "GET /monitors/:id/history",
    },
    cloudflareFeatures: ["D1", "Cron Triggers", "Email (send_email binding)"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    await runMonitorChecks(env);
  },
};
