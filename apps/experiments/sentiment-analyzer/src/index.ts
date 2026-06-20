import { Hono } from "hono";
import type { Env } from "./types/env";
import sentimentRoutes from "./routes/sentiment";

const app = new Hono<{ Bindings: Env }>();

app.route("/", sentimentRoutes);

app.get("/", (c) => {
  return c.json({
    name: "sentiment-analyzer",
    description: "Analyze text sentiment with Workers AI at the edge",
    usage: "GET /sentiment?text=This pizza is great!",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
