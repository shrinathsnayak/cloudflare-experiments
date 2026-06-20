import { CACHE_MAX_AGE_SECONDS } from "../constants/defaults";
import type { FetchResponse } from "../types/fetch";

type CachedFetchOptions = {
  url: string;
  cache: Cache;
  bypass: boolean;
};

export async function fetchWithEdgeCache(options: CachedFetchOptions): Promise<FetchResponse> {
  const { url, cache, bypass } = options;
  const cacheRequest = new Request(url, { method: "GET" });

  if (!bypass) {
    const cached = await cache.match(cacheRequest);
    if (cached) {
      const body = await cached.arrayBuffer();
      return {
        url,
        cacheStatus: "HIT",
        statusCode: cached.status,
        contentType: cached.headers.get("content-type"),
        bodySize: body.byteLength,
      };
    }
  }

  const response = await fetch(url);
  const body = await response.arrayBuffer();
  const contentType = response.headers.get("content-type");

  if (!bypass && response.ok) {
    const toCache = new Response(body, {
      status: response.status,
      headers: {
        "content-type": contentType ?? "application/octet-stream",
        "cache-control": `public, max-age=${CACHE_MAX_AGE_SECONDS}`,
      },
    });
    await cache.put(cacheRequest, toCache);
  }

  return {
    url,
    cacheStatus: bypass ? "BYPASS" : "MISS",
    statusCode: response.status,
    contentType,
    bodySize: body.byteLength,
  };
}
