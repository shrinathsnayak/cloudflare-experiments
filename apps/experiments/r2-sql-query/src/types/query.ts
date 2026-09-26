export type QueryMode = "live" | "demo";

export type QueryResponse = {
  mode: QueryMode;
  query: string;
  warehouse: string;
  rows: unknown[];
  note?: string;
  /** Raw upstream payload when mode is live (for debugging). */
  raw?: unknown;
};

export type ValidateSqlResult =
  | { ok: true; query: string }
  | { ok: false; code: "INVALID_QUERY" | "FORBIDDEN_SQL"; message: string };

export type QueryBody = {
  query?: unknown;
  warehouse?: unknown;
};
