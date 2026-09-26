/// <reference types="@cloudflare/workers-types" />

export interface Env {
  /** Cloudflare account ID for the R2 SQL HTTP API. */
  CLOUDFLARE_ACCOUNT_ID?: string;
  /** API token with R2 SQL / Data Catalog / R2 Storage read permissions. */
  R2_SQL_AUTH_TOKEN?: string;
  /** R2 Data Catalog warehouse / bucket name. */
  WAREHOUSE?: string;
  /** Alternate warehouse name (same as WAREHOUSE). */
  R2_BUCKET_NAME?: string;
}
