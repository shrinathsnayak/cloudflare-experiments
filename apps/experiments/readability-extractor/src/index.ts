import { Hono } from "hono";
import type { Env } from "./types/env";
import extractRoutes from "./routes/extract";

const app = new Hono<{ Bindings: Env }>();

app.route("/", extractRoutes);

app.get("/", (c) => {
  return c.json({
    name: "readability-extractor",
    description:
      "Extract article-style readable content from webpages using Browser Rendering and readability heuristics",
    usage: "GET /extract?url=https://blog.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
