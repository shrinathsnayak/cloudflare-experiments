import { Hono } from "hono";
import type { Env } from "./types/env";
import { ALLOWED_TABLES } from "./constants/sql";
import queryRoutes from "./routes/query";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.json({
    name: "d1-sql-playground",
    description: "Read-only SQL playground over a seeded D1 database",
    usage: 'POST /query with { "sql": "SELECT * FROM products LIMIT 10" }',
    tables: ALLOWED_TABLES,
  });
});

app.route("/", queryRoutes);

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
