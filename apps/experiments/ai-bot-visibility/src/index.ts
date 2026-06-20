import { Hono } from "hono";
import type { Env } from "./types/env";
import checkRoutes from "./routes/check";

const app = new Hono<{ Bindings: Env }>();

app.route("/", checkRoutes);

app.get("/", (c) => {
  return c.json({
    name: "ai-bot-visibility",
    description: "Check if a URL is configured to be visible or blocked for known AI crawlers",
    usage: "GET /check?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
