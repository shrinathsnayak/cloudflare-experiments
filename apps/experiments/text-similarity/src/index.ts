import { Hono } from "hono";
import type { Env } from "./types/env";
import similarityRoutes from "./routes/similarity";

const app = new Hono<{ Bindings: Env }>();

app.route("/", similarityRoutes);

app.get("/", (c) => {
  return c.json({
    name: "text-similarity",
    description: "Compare text similarity with Workers AI embeddings at the edge",
    usage: "GET /similarity?text1=hello&text2=hi",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
