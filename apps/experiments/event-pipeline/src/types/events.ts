export type EventObject = Record<string, unknown>;

export type IngestResponse = {
  ok: true;
  count: number;
  transport: "pipeline" | "r2";
};
