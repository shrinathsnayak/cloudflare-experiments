import { Hono } from "hono";
import type { Env } from "./types/env";
import detectRoutes from "./routes/detect";

const app = new Hono<{ Bindings: Env }>();

app.route("/", detectRoutes);

app.get("/", (c) => {
  return c.json({
    name: "tech-stack-detector",
    description: "Detect technologies used by a website",
    usage: "GET /detect?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
