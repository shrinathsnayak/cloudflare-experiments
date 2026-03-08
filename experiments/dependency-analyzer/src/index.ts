import { Hono } from "hono";
import type { Env } from "./types/env";
import analyzeRoutes from "./routes/analyze";

const app = new Hono<{ Bindings: Env }>();

app.route("/", analyzeRoutes);

app.get("/", (c) => {
  return c.json({
    name: "dependency-analyzer",
    description: "Analyze all external resources loaded by a webpage",
    usage: "GET /analyze?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
