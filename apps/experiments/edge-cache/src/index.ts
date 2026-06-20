import { Hono } from "hono";
import type { Env } from "./types/env";
import fetchRoutes from "./routes/fetch";

const app = new Hono<{ Bindings: Env }>();

app.route("/", fetchRoutes);

app.get("/", (c) => {
  return c.json({
    name: "edge-cache",
    description: "Fetch URLs with the Workers Cache API at the edge",
    usage: "GET /fetch?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
