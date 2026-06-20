import { Hono } from "hono";
import type { Env } from "./types/env";
import llmsTxtRoutes from "./routes/llms-txt";

const app = new Hono<{ Bindings: Env }>();

app.route("/", llmsTxtRoutes);

app.get("/", (c) => {
  return c.json({
    name: "website-to-llms-txt",
    description: "Convert any webpage into llms.txt format for LLM consumption",
    usage: "GET /llms.txt?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
