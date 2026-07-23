import { ALLOWED_PREFIX } from "../constants/defaults";

/**
 * Validate a single read-only SELECT statement.
 */
export function validateSelectSql(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const sql = input.trim().replace(/;+\s*$/, "");
  if (!sql) return null;
  if (sql.includes(";")) return null;
  if (!sql.toLowerCase().startsWith(ALLOWED_PREFIX)) return null;
  if (/\b(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/i.test(sql)) {
    return null;
  }
  return sql;
}

export function redactConnectionString(connectionString: string): {
  host: string;
  database: string;
  user: string;
} {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname + (url.port ? `:${url.port}` : ""),
      database: url.pathname.replace(/^\//, "") || "postgres",
      user: decodeURIComponent(url.username || "unknown"),
    };
  } catch {
    return { host: "unknown", database: "unknown", user: "unknown" };
  }
}
