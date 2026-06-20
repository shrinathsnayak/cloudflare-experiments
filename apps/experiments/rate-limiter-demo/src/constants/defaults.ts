import type { RateLimitConfig } from "../types/env";

export const RATE_LIMIT: RateLimitConfig = {
  limit: 10,
  periodSeconds: 60,
};
