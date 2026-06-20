import type { Context } from "hono";

/**
 * Returns the incoming request's Cloudflare metadata (request.cf).
 * Empty object when not available (e.g. local dev).
 */
export function getCf(c: Context): Record<string, unknown> {
  const req = c.req.raw as Request & { cf?: Record<string, unknown> };
  const cf = req.cf;
  if (!cf || typeof cf !== "object") return {};
  return { ...cf } as Record<string, unknown>;
}
