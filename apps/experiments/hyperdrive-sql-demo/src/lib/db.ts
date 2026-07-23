import postgres from "postgres";
import { MAX_ROWS } from "../constants/defaults";
import type { PingResponse, QueryResponse } from "../types/query";

function createClient(connectionString: string) {
  return postgres(connectionString, {
    max: 5,
    fetch_types: false,
    prepare: true,
  });
}

export async function pingDatabase(connectionString: string): Promise<PingResponse> {
  const sql = createClient(connectionString);
  const start = Date.now();
  try {
    const rows = await sql<
      {
        current_database: string;
        current_user: string;
        version: string;
      }[]
    >`select current_database(), current_user, version()`;
    const row = rows[0];
    return {
      ok: true,
      database: row.current_database,
      user: row.current_user,
      serverVersion: row.version,
      latencyMs: Date.now() - start,
    };
  } finally {
    await sql.end({ timeout: 1 });
  }
}

export async function runSelectQuery(
  connectionString: string,
  query: string
): Promise<QueryResponse> {
  const sql = createClient(connectionString);
  const start = Date.now();
  try {
    const rows = (await sql.unsafe(query)) as Record<string, unknown>[];
    return {
      sql: query,
      rowCount: Math.min(rows.length, MAX_ROWS),
      rows: rows.slice(0, MAX_ROWS),
      latencyMs: Date.now() - start,
    };
  } finally {
    await sql.end({ timeout: 1 });
  }
}
