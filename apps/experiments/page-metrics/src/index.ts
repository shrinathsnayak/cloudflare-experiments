import { Hono } from "hono";
import type { Env } from "./types/env";
import metricsRoutes from "./routes/metrics";

const app = new Hono<{ Bindings: Env }>();

app.route("/", metricsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "page-metrics",
    description: "Collect Puppeteer page load metrics using Browser Rendering",
    usage: "GET /metrics?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
