/// <reference types="@cloudflare/workers-types" />

export interface Env {
  AI: Ai;
  AUDIO_CACHE: R2Bucket;
}
