import { Hono } from "hono";
import type { Env } from "./types/env";
import wsRoutes from "./routes/ws";

const app = new Hono<{ Bindings: Env }>();

app.route("/", wsRoutes);

app.get("/info", (c) => {
  return c.json({
    name: "live-cursor-tracker",
    description: "Real-time cursor positions broadcast over WebSocket via Durable Objects",
    usage: "GET / (demo page), GET /ws/:room (WebSocket upgrade)",
    cloudflareFeatures: ["Durable Objects", "WebSocket Hibernation API"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
