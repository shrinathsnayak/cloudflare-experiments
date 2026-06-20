import { Hono } from "hono";
import type { Env } from "./types/env";
import echoRoutes from "./routes/echo";

const app = new Hono<{ Bindings: Env }>();

app.route("/", echoRoutes);

app.get("/", (c) => {
  return c.json({
    name: "websocket-echo",
    description: "WebSocket echo server running on Cloudflare Workers",
    usage: "GET /echo (WebSocket upgrade)",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
