import { Hono } from "hono";
import type { Env } from "./types/env";
import inspectRoutes from "./routes/inspect";

const app = new Hono<{ Bindings: Env }>();

app.route("/", inspectRoutes);

app.get("/", (c) => {
  return c.json({
    name: "robots-sitemap-inspector",
    description: "Parse robots.txt and linked sitemaps for any URL from the edge",
    usage: "GET /inspect?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
