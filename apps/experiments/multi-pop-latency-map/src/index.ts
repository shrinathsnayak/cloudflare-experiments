import { Hono } from "hono";
import type { Env } from "./types/env";
import latencyRoutes from "./routes/latency";

const app = new Hono<{ Bindings: Env }>();

app.route("/", latencyRoutes);

app.get("/", (c) => {
  return c.json({
    name: "multi-pop-latency-map",
    description: "Measure fetch latency and report the serving Cloudflare colo",
    usage: "GET /latency?url=https://example.com",
    limitation: "Single PoP per invocation — see response.limitation field for details",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
