import { Hono } from "hono";
import type { Env } from "./types/env";
import generateRoutes from "./routes/generate";

const app = new Hono<{ Bindings: Env }>();

app.route("/", generateRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ai-image-generator",
    description: "Generate images from text prompts with Workers AI at the edge",
    usage: "GET /generate?prompt=a sunset over mountains",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
