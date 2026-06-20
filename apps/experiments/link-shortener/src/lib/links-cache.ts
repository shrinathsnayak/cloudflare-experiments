import type { Env } from "../types/env";

const CACHE_KEY_PREFIX = "link:";

/**
 * Get URL by short code: read from KV cache first; on miss read from D1 and populate cache.
 * D1 remains the source of truth.
 */
export async function getUrlByCode(env: Env, code: string): Promise<string | null> {
  const cacheKey = CACHE_KEY_PREFIX + code;

  const cached = await env.LINKS_CACHE.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const row = await env.DB.prepare("SELECT url FROM links WHERE code = ?")
    .bind(code)
    .first<{ url: string }>();

  if (!row?.url) {
    return null;
  }

  await env.LINKS_CACHE.put(cacheKey, row.url);
  return row.url;
}

/**
 * Write code -> url to KV cache. Call after inserting into D1 so redirects can read from cache.
 */
export async function setCachedLink(env: Env, code: string, url: string): Promise<void> {
  const cacheKey = CACHE_KEY_PREFIX + code;
  await env.LINKS_CACHE.put(cacheKey, url);
}
