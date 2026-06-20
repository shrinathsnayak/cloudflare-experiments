import type { ColumnMeta, QueryResponse } from "../types/query";
import { inferColumnType } from "./sql";

export async function runSelectQuery(db: D1Database, sql: string): Promise<QueryResponse> {
  const started = Date.now();
  const result = await db.prepare(sql).all<Record<string, unknown>>();
  const rows = result.results ?? [];

  return {
    columns: buildColumnMetadata(rows),
    rows,
    rowCount: rows.length,
    durationMs: Date.now() - started,
  };
}

function buildColumnMetadata(rows: Record<string, unknown>[]): ColumnMeta[] {
  if (rows.length === 0) {
    return [];
  }

  return Object.keys(rows[0]).map((name) => ({
    name,
    type: inferColumnType(rows[0][name]),
  }));
}
