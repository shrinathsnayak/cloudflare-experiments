import { Hono } from "hono";
import type { Env } from "./types/env";
import statusRoutes from "./routes/status";
import pingRoutes from "./routes/ping";
import queryRoutes from "./routes/query";

const app = new Hono<{ Bindings: Env }>();

app.route("/", statusRoutes);
app.route("/", pingRoutes);
app.route("/", queryRoutes);

app.get("/", (c) => {
  return c.json({
    name: "hyperdrive-sql-demo",
    description:
      "Query an existing PostgreSQL database through Cloudflare Hyperdrive connection pooling",
    usage: {
      status: "GET /status",
      ping: "GET /ping",
      query: 'POST /query {"sql":"SELECT 1 AS ok"}',
    },
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
