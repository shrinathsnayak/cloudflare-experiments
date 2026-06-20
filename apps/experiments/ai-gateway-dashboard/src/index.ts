import { Hono } from "hono";
import type { Env } from "./types/env";
import generateRoutes from "./routes/generate";

const app = new Hono<{ Bindings: Env }>();

app.route("/", generateRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ai-gateway-dashboard",
    description:
      "Generate text through Workers AI and AI Gateway with cache metadata and latency comparison",
    usage: "POST /generate with { prompt, compareCache? }",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
