/// <reference types="@cloudflare/workers-types" />

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  RATE_LIMITER: RateLimiter;
  USAGE: KVNamespace;
}

export type RateLimitConfig = {
  limit: number;
  periodSeconds: number;
};

export type UsageRecord = {
  key: string;
  allowed: number;
  blocked: number;
  lastSeen: string;
};
