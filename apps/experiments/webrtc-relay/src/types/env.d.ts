/// <reference types="@cloudflare/workers-types" />

export interface Env {
  REALTIME_APP_ID?: string;
  /** Set via `wrangler secret put TURN_API_TOKEN`. */
  TURN_API_TOKEN?: string;
}
