import {
  DEFAULT_WAREHOUSE,
  DEMO_ROWS,
  MAX_QUERY_LENGTH,
  R2_SQL_API_BASE,
} from "../constants/defaults";
import type { Env } from "../types/env";
import type { QueryResponse, ValidateSqlResult } from "../types/query";

const FORBIDDEN_PREFIXES = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE"];

/**
 * Allow only read-only SQL: statements that start with SELECT or SHOW.
 * Rejects empty/oversized queries and common mutating prefixes.
 */
export function validateSql(input: string | undefined | null): ValidateSqlResult {
  if (input === undefined || input === null || typeof input !== "string") {
    return {
      ok: false,
      code: "INVALID_QUERY",
      message: "Missing or invalid query",
    };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: false,
      code: "INVALID_QUERY",
      message: "Missing or invalid query",
    };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      ok: false,
      code: "INVALID_QUERY",
      message: `Query exceeds max length of ${MAX_QUERY_LENGTH} characters`,
    };
  }

  const upper = trimmed.toUpperCase();
  for (const prefix of FORBIDDEN_PREFIXES) {
    if (
      upper.startsWith(prefix) &&
      (upper.length === prefix.length || /\s/.test(upper[prefix.length]!))
    ) {
      return {
        ok: false,
        code: "FORBIDDEN_SQL",
        message: `Only SELECT and SHOW queries are allowed; ${prefix} is forbidden`,
      };
    }
  }

  if (!(upper.startsWith("SELECT") || upper.startsWith("SHOW"))) {
    return {
      ok: false,
      code: "FORBIDDEN_SQL",
      message: "Only SELECT and SHOW queries are allowed",
    };
  }

  // Require a word boundary after SELECT/SHOW (e.g. reject SELECTOR)
  const firstWord = upper.split(/\s+/, 1)[0] ?? "";
  if (firstWord !== "SELECT" && firstWord !== "SHOW") {
    return {
      ok: false,
      code: "FORBIDDEN_SQL",
      message: "Only SELECT and SHOW queries are allowed",
    };
  }

  return { ok: true, query: trimmed };
}

export function isConfigured(env: Env): boolean {
  return Boolean(env.CLOUDFLARE_ACCOUNT_ID?.trim() && env.R2_SQL_AUTH_TOKEN?.trim());
}

export function resolveWarehouse(env: Env, override?: string | null): string {
  const fromBody = override?.trim();
  if (fromBody) return fromBody;
  const fromEnv = env.WAREHOUSE?.trim() || env.R2_BUCKET_NAME?.trim();
  return fromEnv || DEFAULT_WAREHOUSE;
}

function extractRows(payload: unknown): unknown[] {
  if (payload === null || payload === undefined) return [];
  if (Array.isArray(payload)) return payload;

  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.rows)) return obj.rows;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.result)) return obj.result;

    if (obj.result && typeof obj.result === "object") {
      const result = obj.result as Record<string, unknown>;
      if (Array.isArray(result.rows)) return result.rows;
      if (Array.isArray(result.data)) return result.data;
    }
  }

  return [];
}

export function demoQueryResult(query: string, warehouse: string): QueryResponse {
  return {
    mode: "demo",
    query,
    warehouse,
    rows: [...DEMO_ROWS],
    note: "Configure CLOUDFLARE_ACCOUNT_ID and R2_SQL_AUTH_TOKEN for live R2 SQL queries",
  };
}

/**
 * Run a validated SQL query against the R2 SQL HTTP API, or return demo rows
 * when account credentials are not configured.
 */
export async function runQuery(
  env: Env,
  query: string,
  warehouseOverride?: string | null
): Promise<QueryResponse> {
  const warehouse = resolveWarehouse(env, warehouseOverride);

  if (!isConfigured(env)) {
    return demoQueryResult(query, warehouse);
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID!.trim();
  const token = env.R2_SQL_AUTH_TOKEN!.trim();
  const url = `${R2_SQL_API_BASE}/${encodeURIComponent(accountId)}/r2-sql/query/${encodeURIComponent(warehouse)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `R2 SQL API returned ${res.status}`);
  }

  const raw: unknown = await res.json();
  return {
    mode: "live",
    query,
    warehouse,
    rows: extractRows(raw),
    raw,
  };
}
