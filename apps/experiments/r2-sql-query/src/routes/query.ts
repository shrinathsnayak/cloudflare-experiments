import { Hono } from "hono";
import type { Context } from "hono";
import type { Env } from "../types/env";
import type { QueryBody } from "../types/query";
import { runQuery, validateSql } from "../lib/sql";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

async function handleQuery(
  c: Context<{ Bindings: Env }>,
  queryInput: string | undefined | null,
  warehouseInput?: string | null
) {
  const validated = validateSql(queryInput);
  if (!validated.ok) {
    return jsonError(c, validated.message, validated.code);
  }

  try {
    const result = await runQuery(c.env, validated.query, warehouseInput);
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "R2 SQL query failed";
    return jsonError(c, message, "QUERY_ERROR", 502);
  }
}

app.get("/query", async (c) => {
  const q = c.req.query("q") ?? c.req.query("query");
  const warehouse = c.req.query("warehouse") ?? undefined;
  return handleQuery(c, q, warehouse);
});

app.post("/query", async (c) => {
  let body: QueryBody = {};
  try {
    body = (await c.req.json()) as QueryBody;
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_QUERY");
  }

  const query =
    typeof body.query === "string"
      ? body.query
      : typeof c.req.query("q") === "string"
        ? c.req.query("q")
        : typeof c.req.query("query") === "string"
          ? c.req.query("query")
          : undefined;

  const warehouse =
    typeof body.warehouse === "string"
      ? body.warehouse
      : typeof c.req.query("warehouse") === "string"
        ? c.req.query("warehouse")
        : undefined;

  return handleQuery(c, query, warehouse);
});

export default app;
