/// <reference types="@cloudflare/workers-types" />

import type { PipelineParams } from "./workflow";

export interface Env {
  AI: Ai;
  SUMMARIES: R2Bucket;
  PIPELINE: Workflow<PipelineParams>;
}
