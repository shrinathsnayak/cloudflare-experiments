import { ALLOWED_TABLES, MAX_SQL_LENGTH } from "../constants/sql";

const FORBIDDEN_KEYWORD =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|GRANT|REVOKE|INTO|UNION)\b/i;

const TABLE_REFERENCE = /\b(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;

export function extractTableNames(sql: string): string[] {
  const tables = new Set<string>();
  for (const match of sql.matchAll(TABLE_REFERENCE)) {
    const table = match[1]?.toLowerCase();
    if (table) {
      tables.add(table);
    }
  }
  return [...tables];
}

export function validateSelectSql(input: string | undefined): string | null {
  if (input === undefined || typeof input !== "string") {
    return null;
  }

  const sql = input.trim();
  if (!sql || sql.length > MAX_SQL_LENGTH) {
    return null;
  }

  if (sql.includes(";")) {
    return null;
  }

  if (/--|\/\*/.test(sql)) {
    return null;
  }

  if (!/^SELECT\b/i.test(sql)) {
    return null;
  }

  if (FORBIDDEN_KEYWORD.test(sql)) {
    return null;
  }

  const tables = extractTableNames(sql);
  if (tables.length === 0) {
    return null;
  }

  const allowed = new Set<string>(ALLOWED_TABLES);
  if (tables.some((table) => !allowed.has(table))) {
    return null;
  }

  return sql;
}

export function inferColumnType(value: unknown): "number" | "boolean" | "text" | "null" {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  return "text";
}
