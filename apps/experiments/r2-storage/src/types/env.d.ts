/// <reference types="@cloudflare/workers-types" />

export interface Env {
  BUCKET: R2Bucket;
  PUBLIC_BUCKET: R2Bucket;
  /** Base URL for public bucket (e.g. https://pub-xxx.r2.dev). Set in wrangler.json vars or dashboard. */
  PUBLIC_BUCKET_URL?: string;
}
