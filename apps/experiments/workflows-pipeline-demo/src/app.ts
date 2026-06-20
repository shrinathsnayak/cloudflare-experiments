import { Hono } from "hono";
import type { Env } from "./types/env";
import runRoutes from "./routes/run";
import statusRoutes from "./routes/status";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.json({
    name: "workflows-pipeline-demo",
    description: "Durable pipeline: fetch URL, summarize with Workers AI, store in R2",
    usage: {
      run: 'POST /run with { "url": "https://example.com" }',
      status: "GET /status/:instanceId",
    },
    cloudflareFeatures: ["Workflows", "Workers AI", "R2"],
  });
});

app.route("/", runRoutes);
app.route("/", statusRoutes);

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
