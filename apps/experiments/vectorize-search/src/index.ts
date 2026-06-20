import { Hono } from "hono";
import type { Env } from "./types/env";
import upsertRoutes from "./routes/upsert";
import searchRoutes from "./routes/search";

const app = new Hono<{ Bindings: Env }>();

app.route("/", upsertRoutes);
app.route("/", searchRoutes);

app.get("/", (c) => {
  return c.json({
    name: "vectorize-search",
    description: "Semantic search with Workers AI embeddings and Vectorize at the edge",
    usage: "POST /upsert { id, text } | GET /search?q=&topK=5",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
