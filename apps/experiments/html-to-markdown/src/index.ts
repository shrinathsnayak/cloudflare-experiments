import { Hono } from "hono";
import type { Env } from "./types/env";
import markdownRoutes from "./routes/markdown";

const app = new Hono<{ Bindings: Env }>();

app.route("/", markdownRoutes);

app.get("/", (c) => {
  return c.json({
    name: "html-to-markdown",
    description: "Convert any webpage HTML into clean Markdown from the edge",
    usage: "GET /markdown?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
