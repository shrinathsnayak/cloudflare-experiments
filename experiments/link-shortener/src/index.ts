import { Hono } from "hono";
import type { Env } from "./types/env";
import shortenRoutes from "./routes/shorten";
import redirectRoutes from "./routes/redirect";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.json({
    name: "link-shortener",
    description: "Shorten URLs and redirect with D1 (primary) and KV (read cache)",
    usage: 'POST /shorten with { "url": "..." }, GET /:code to redirect',
  });
});

app.route("/", shortenRoutes);
app.route("/", redirectRoutes);

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
