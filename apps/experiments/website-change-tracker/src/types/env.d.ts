interface Env {
  DB: D1Database;
  SNAPSHOTS: R2Bucket;
  BROWSER: Fetcher;
}

export type { Env };
