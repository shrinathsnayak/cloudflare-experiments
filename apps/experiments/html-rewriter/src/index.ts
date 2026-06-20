import { Hono } from "hono";
import type { Env } from "./types/env";
import rewriteRoutes from "./routes/rewrite";

const app = new Hono<{ Bindings: Env }>();

app.route("/", rewriteRoutes);

app.get("/", (c) => {
  return c.json({
    name: "html-rewriter",
    description: "Extract HTML stats and transform pages with HTMLRewriter at the edge",
    usage: "GET /stats?url=https://example.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
