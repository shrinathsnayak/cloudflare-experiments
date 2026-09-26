import { Hono } from "hono";
import type { Env } from "./types/env";
import searchRoutes from "./routes/search";

const app = new Hono<{ Bindings: Env }>();

app.route("/", searchRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ai-search-demo",
    description: "Query Cloudflare AI Search (managed RAG) from a Worker",
    usage: {
      search: "GET /search?q=your+question",
    },
    cloudflareFeatures: ["AI Search / AutoRAG", "Workers AI"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
