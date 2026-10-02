import { env } from "cloudflare:workers";
import { jsonApiError } from "@/lib/api-error";

/** Matches `wrangler.jsonc` `ratelimits[0].simple` (60 req / 60s). */
const API_RATE_LIMIT_PERIOD_SECONDS = 60;

function clientKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}

/**
 * Enforce the Workers Rate Limiting binding on public API routes.
 * Returns a 429 Response when limited; otherwise `null`.
 */
export async function enforceApiRateLimit(
  request: Request,
  bucket: "search" | "mcp"
): Promise<Response | null> {
  const limiter = env.API_RATE_LIMITER;
  // Local/preview without the binding: fail open so docs still work.
  if (!limiter) return null;

  const key = `${bucket}:${clientKey(request)}`;
  const { success } = await limiter.limit({ key });
  if (success) return null;

  return jsonApiError("Rate limit exceeded", "RATE_LIMITED", 429, {
    headers: {
      "Retry-After": String(API_RATE_LIMIT_PERIOD_SECONDS),
    },
    extras: {
      retryAfterSeconds: API_RATE_LIMIT_PERIOD_SECONDS,
    },
  });
}
