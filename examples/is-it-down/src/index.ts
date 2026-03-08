import { Hono } from "hono";
import type { Env } from "./types/env";
import checkRoutes from "./routes/check";

const app = new Hono<{ Bindings: Env }>();

app.route("/", checkRoutes);

app.get("/", (c) => {
  return c.json({
    name: "is-it-down",
    description: "Check if a website is reachable from Cloudflare's edge",
    usage: "GET /check?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
