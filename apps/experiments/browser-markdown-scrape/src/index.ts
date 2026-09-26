import { Hono } from "hono";
import type { Env } from "./types/env";
import markdownRoutes from "./routes/markdown";
import scrapeRoutes from "./routes/scrape";

const app = new Hono<{ Bindings: Env }>();

app.route("/", markdownRoutes);
app.route("/", scrapeRoutes);

app.get("/", (c) => {
  return c.json({
    name: "browser-markdown-scrape",
    description:
      "Convert URLs to Markdown and scrape CSS selectors via Browser Rendering quickAction",
    usage: {
      markdown: "GET /markdown?url=https://example.com",
      scrape: "GET /scrape?url=https://example.com&selector=h1",
    },
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
