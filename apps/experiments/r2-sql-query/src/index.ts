import { Hono } from "hono";
import type { Env } from "./types/env";
import queryRoutes from "./routes/query";

const app = new Hono<{ Bindings: Env }>();

app.route("/", queryRoutes);

app.get("/", (c) => {
  return c.json({
    name: "r2-sql-query",
    description: "Query Apache Iceberg tables managed by R2 Data Catalog via the R2 SQL HTTP API",
    usage: {
      post: 'POST /query with JSON { "query": "SELECT ...", "warehouse": "optional" }',
      get: "GET /query?q=SELECT+%2A+FROM+default.table+LIMIT+10",
    },
    cloudflareFeatures: ["R2 SQL", "R2 Data Catalog", "Apache Iceberg"],
  });
});

app.onError((err, c) => {
  return c.json({ error: err.message, code: "INTERNAL_ERROR" }, 500);
});

export default {
  fetch: app.fetch,
};
