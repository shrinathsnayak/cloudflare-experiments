/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  EMAIL: SendEmail;
  FORM_RATE_LIMITER: RateLimit;
  FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_TOKEN?: string;
  IP_HASH_SALT?: string;
}
