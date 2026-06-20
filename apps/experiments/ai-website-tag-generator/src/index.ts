import { Hono } from "hono";
import type { Env } from "./types/env";
import tagsRoutes from "./routes/tags";

const app = new Hono<{ Bindings: Env }>();

app.route("/", tagsRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ai-website-tag-generator",
    description: "Generate topic tags for any website using Workers AI",
    usage: "GET /tags?url=https://cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
