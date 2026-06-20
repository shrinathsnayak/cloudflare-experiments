import { Hono } from "hono";
import type { Env } from "./types/env";
import { snapshotTrackedUrls } from "./lib/track";
import trackRoutes from "./routes/track";

const app = new Hono<{ Bindings: Env }>();

app.route("/", trackRoutes);

app.get("/", (c) => {
  return c.json({
    name: "website-change-tracker",
    description:
      "Track website content changes with scheduled Browser Rendering snapshots stored in R2 and diff history in D1",
    usage: {
      register: "POST /track { url }",
      unregister: "DELETE /track?url=",
      history: "GET /history?url=",
    },
    cloudflareFeatures: ["Browser Rendering", "R2", "D1", "Cron Triggers"],
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
    await snapshotTrackedUrls(env);
  },
};
