import { Hono } from "hono";
import type { Env } from "./types/env";
import turnRoutes from "./routes/turn";

const app = new Hono<{ Bindings: Env }>();

app.route("/", turnRoutes);

app.get("/", (c) => {
  return c.json({
    name: "webrtc-relay",
    description:
      "Issue Cloudflare Realtime TURN credentials for WebRTC (demo mode without secrets)",
    usage: "GET /turn-credentials?ttl=86400 or GET /ice-servers",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
