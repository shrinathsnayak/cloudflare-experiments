import { Hono } from "hono";
import type { Env } from "./types/env";
import whereamiRoutes from "./routes/whereami";

const app = new Hono<{ Bindings: Env }>();

app.route("/", whereamiRoutes);

app.get("/", (c) => {
  return c.json({
    name: "whereami",
    description: "Request metadata from Cloudflare's edge (request.cf)",
    usage: "GET /whereami",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
