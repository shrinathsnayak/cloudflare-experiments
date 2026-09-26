/// <reference types="@cloudflare/workers-types" />

/** Cloudflare Pipelines binding for streaming events to R2/Iceberg. */
export interface PipelineBinding {
  send(events: Record<string, unknown>[]): Promise<void>;
}

export interface Env {
  /** Pipelines binding; when absent, events fall back to R2 JSONL. */
  PIPELINE?: PipelineBinding;
  /** R2 fallback for local demo when PIPELINE is not configured. */
  EVENTS: R2Bucket;
}
