import { Hono } from "hono";
import type { Env } from "./types/env";
import askRoutes from "./routes/ask";

const app = new Hono<{ Bindings: Env }>();

app.route("/", askRoutes);

app.get("/", (c) => {
  return c.json({
    name: "rag-mini-search",
    description: "Mini RAG over experiment docs using Vectorize + Workers AI",
    usage: {
      seed: "POST /seed (load demo corpus into Vectorize)",
      ask: 'POST /ask with { "question": "..." }',
    },
    cloudflareFeatures: ["Vectorize", "Workers AI"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
