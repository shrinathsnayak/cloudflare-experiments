/**
 * Minimal typings for vinext + Workers bindings used by the docs app.
 * Prefer `npx wrangler types` locally when debugging the full runtime surface;
 * that output is gitignored (`worker-configuration.d.ts`).
 */
interface RateLimitOptions {
  key: string;
}

interface RateLimitOutcome {
  success: boolean;
}

interface RateLimit {
  limit(options: RateLimitOptions): Promise<RateLimitOutcome>;
}

declare namespace Cloudflare {
  interface Env {
    API_RATE_LIMITER: RateLimit;
  }
}

declare module "cloudflare:workers" {
  export const env: Cloudflare.Env;
}
