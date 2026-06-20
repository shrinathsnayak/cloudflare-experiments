import { Hono } from "hono";
import type { Env } from "./types/env";
import limitedRoutes from "./routes/limited";

const app = new Hono<{ Bindings: Env }>();

app.route("/", limitedRoutes);

app.get("/", (c) => {
  return c.json({
    name: "rate-limiter-demo",
    description: "Workers Rate Limiting binding demo with 429 responses",
    usage: {
      limited: "GET /limited (optional ?key= override)",
      status: "GET /status?key=...",
    },
    cloudflareFeatures: ["Rate Limiting binding", "Workers KV"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
