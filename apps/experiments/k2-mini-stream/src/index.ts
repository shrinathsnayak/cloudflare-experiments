import { Hono } from "hono";
import type { Env } from "./types/env";
import k2Routes from "./routes/k2";

const app = new Hono<{ Bindings: Env }>();

app.route("/", k2Routes);

app.get("/", (c) => {
  return c.json({
    name: "k2-mini-stream",
    description: "Produce events to Cloudflare K2 and read them back in order",
    usage: "GET /demo - Produce sample events and consume them",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
