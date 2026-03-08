import { Hono } from "hono";
import type { Env } from "./types/env";
import latencyRoutes from "./routes/latency";

const app = new Hono<{ Bindings: Env }>();

app.route("/", latencyRoutes);

app.get("/", (c) => {
  return c.json({
    name: "global-latency-tester",
    description: "Measure how fast a website responds from the Cloudflare edge",
    usage: {
      single: "GET /latency?url=https://www.cloudflare.com",
      global: "GET /latency/global?url=https://www.cloudflare.com — check from multiple edge locations",
    },
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
