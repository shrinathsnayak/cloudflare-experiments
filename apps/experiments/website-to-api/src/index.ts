import { Hono } from "hono";
import type { Env } from "./types/env";
import apiRoutes from "./routes/api";

const app = new Hono<{ Bindings: Env }>();

app.route("/", apiRoutes);

app.get("/", (c) => {
  return c.json({
    name: "website-to-api",
    description: "Turn any webpage into structured JSON",
    usage: "GET /api?url=https://www.cloudflare.com",
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default { fetch: app.fetch };
