export type QueryRequestBody = {
  sql: string;
};

export type ColumnMeta = {
  name: string;
  type: "number" | "boolean" | "text" | "null";
};

export type QueryResponse = {
  columns: ColumnMeta[];
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
};

export type QueryErrorResponse = {
  error: string;
  code: string;
};
