import { Hono } from "hono";
import type { Env } from "./types/env";
import searchRoutes from "./routes/search";

const app = new Hono<{ Bindings: Env }>();

app.route("/", searchRoutes);

app.get("/", (c) => {
  return c.json({
    name: "web-search",
    description: "Web Search API through AI Gateway (ceramic, exa, or linkup providers)",
    usage: 'POST /search with { "query": "...", "provider": "ceramic", "limit": 5 }',
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
