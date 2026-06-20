import { Hono } from "hono";
import type { Env } from "./types/env";
import linksRoutes from "./routes/links";

const app = new Hono<{ Bindings: Env }>();

app.route("/", linksRoutes);

app.get("/", (c) => {
  return c.json({
    name: "browser-links",
    description: "Extract links from JavaScript-rendered pages using Browser Rendering",
    usage: "GET /links?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
