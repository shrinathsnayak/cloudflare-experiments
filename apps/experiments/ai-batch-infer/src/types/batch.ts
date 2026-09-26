export type QueuedBatchResponse = {
  status: "queued";
  model: string;
  request_id: string;
  mode?: "demo" | "live";
  note?: string;
};

export type BatchPollResponse = {
  status?: "queued" | "running" | "completed";
  model?: string;
  request_id?: string;
  responses?: unknown[];
  result?: unknown;
  mode?: "demo" | "live";
  note?: string;
  [key: string]: unknown;
};

export type BatchSubmitBody = {
  texts: string[];
};
