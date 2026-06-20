import { Hono } from "hono";
import type { Env } from "./types/env";
import trackRoutes from "./routes/track";

const app = new Hono<{ Bindings: Env }>();

app.route("/", trackRoutes);

app.get("/", (c) => {
  return c.json({
    name: "analytics-engine",
    description: "Write custom events to Workers Analytics Engine at the edge",
    usage: "POST /track with JSON { event, value?, tag? }",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
