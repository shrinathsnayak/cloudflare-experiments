export type PingResponse = {
  ok: true;
  database: string;
  user: string;
  serverVersion: string;
  latencyMs: number;
};

export type QueryResponse = {
  sql: string;
  rowCount: number;
  rows: Record<string, unknown>[];
  latencyMs: number;
};
