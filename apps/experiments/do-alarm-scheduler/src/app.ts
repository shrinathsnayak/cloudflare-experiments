import { Hono } from "hono";
import type { Env } from "./types/env";
import scheduleRoutes from "./routes/schedule";

const app = new Hono<{ Bindings: Env }>();

app.route("/", scheduleRoutes);

app.get("/", (c) => {
  return c.json({
    name: "do-alarm-scheduler",
    description: "Schedule one-off reminders with the Durable Object Alarm API",
    usage: {
      schedule: 'POST /schedule { "seconds": 30, "message": "..." }',
      status: "GET /status/:id",
    },
    cloudflareFeatures: ["Durable Objects", "Alarm API"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
