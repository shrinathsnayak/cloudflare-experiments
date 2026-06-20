import { Hono } from "hono";
import type { Env } from "../types/env";
import type { QueryRequestBody } from "../types/query";
import { runSelectQuery } from "../lib/query";
import { validateSelectSql } from "../lib/sql";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/query", async (c) => {
  let body: QueryRequestBody;
  try {
    body = (await c.req.json()) as QueryRequestBody;
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const sql = validateSelectSql(body.sql);
  if (!sql) {
    return jsonError(
      c,
      "Invalid SQL: only single read-only SELECT statements against allowed tables (products, experiments) are permitted",
      "INVALID_SQL"
    );
  }

  try {
    const result = await runSelectQuery(c.env.DB, sql);
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query execution failed";
    return jsonError(c, message, "QUERY_ERROR", 502);
  }
});

export default app;
