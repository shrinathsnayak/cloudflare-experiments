import { Hono } from "hono";
import type { Env } from "./types/env";
import screenshotRoutes from "./routes/screenshot";

const app = new Hono<{ Bindings: Env }>();

app.route("/", screenshotRoutes);

app.get("/", (c) => {
  return c.json({
    name: "screenshot-api",
    description: "Capture screenshots of any website from the edge (Browser Rendering)",
    usage: "GET /screenshot?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
