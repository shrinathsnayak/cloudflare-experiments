import { Hono } from "hono";
import type { Env } from "./types/env";
import summaryRoutes from "./routes/summary";

const app = new Hono<{ Bindings: Env }>();

app.route("/", summaryRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ai-website-summary",
    description: "Summarize any webpage using Workers AI",
    usage: "GET /summary?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
