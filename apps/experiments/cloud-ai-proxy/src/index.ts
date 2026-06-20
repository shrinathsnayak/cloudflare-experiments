import { Hono } from "hono";
import type { Env } from "./types/env";
import chatRoutes from "./routes/chat";

const app = new Hono<{ Bindings: Env }>();

app.route("/", chatRoutes);

app.get("/", (c) => {
  return c.json({
    name: "cloud-ai-proxy",
    description: "Call Workers AI with any model and prompt from a single public endpoint",
    usage: "POST /chat with { model, prompt? } or GET /chat?model=...&prompt=...",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
