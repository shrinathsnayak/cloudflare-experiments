/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  EMAIL: SendEmail;
  ALERT_FROM_EMAIL?: string;
}
