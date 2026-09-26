import { Hono } from "hono";
import type { Env } from "./types/env";
import inspectRoutes from "./routes/inspect";

const app = new Hono<{ Bindings: Env }>();

app.route("/", inspectRoutes);

app.get("/", (c) => {
  return c.json({
    name: "browser-cdp-inspect",
    description:
      "Browser Rendering inspection — title, cookies, performance timing via Puppeteer/CDP",
    usage: "GET /inspect?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
