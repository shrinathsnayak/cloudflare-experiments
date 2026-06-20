import { Hono } from "hono";
import type { Env } from "./types/env";
import translateRoutes from "./routes/translate";

const app = new Hono<{ Bindings: Env }>();

app.route("/", translateRoutes);

app.get("/", (c) => {
  return c.json({
    name: "text-translator",
    description: "Translate text with Workers AI at the edge",
    usage: "GET /translate?text=hello&target=es&source=en",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
