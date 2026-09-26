import { Hono } from "hono";
import type { Env } from "./types/env";
import execRoutes from "./routes/exec";

const app = new Hono<{ Bindings: Env }>();

app.route("/", execRoutes);

app.get("/", (c) => {
  return c.json({
    name: "code-sandbox",
    description: "Run a JavaScript snippet in an isolated Sandbox SDK container",
    usage: {
      exec: 'POST /exec with { language: "javascript", code: string }',
    },
    cloudflareFeatures: ["Sandbox SDK", "Containers", "Durable Objects"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default app;
