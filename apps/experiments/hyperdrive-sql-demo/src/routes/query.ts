import { Hono } from "hono";
import type { Env } from "../types/env";
import { runSelectQuery } from "../lib/db";
import { validateSelectSql } from "../lib/sql";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/query", async (c) => {
  const connectionString = c.env.HYPERDRIVE?.connectionString;
  if (!connectionString) {
    return jsonError(c, "HYPERDRIVE binding is missing", "MISSING_BINDING", 502);
  }

  let body: { sql?: unknown };
  try {
    body = (await c.req.json()) as { sql?: unknown };
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const sql = validateSelectSql(body.sql);
  if (!sql) {
    return jsonError(
      c,
      "Invalid SQL: only a single read-only SELECT statement is allowed",
      "INVALID_SQL"
    );
  }

  try {
    const result = await runSelectQuery(connectionString, sql);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Query failed";
    return jsonError(c, message, "DB_ERROR", 502);
  }
});

export default app;
