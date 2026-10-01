import { FETCH_TIMEOUT_MS, USER_AGENT } from "../constants/defaults";
import type { HttpHeadersResult, UptimeResult } from "../types/tools";

function request(url: string, method: "GET" | "HEAD"): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "follow",
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

/** Fetches a URL and returns its status and response headers (body is discarded). */
export async function getHttpHeaders(url: string): Promise<HttpHeadersResult> {
  const res = await request(url, "GET");
  await res.body?.cancel();
  return {
    url,
    finalUrl: res.url || url,
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

/** Checks whether a URL responds with a 2xx/3xx status and measures latency. */
export async function checkUptime(url: string): Promise<UptimeResult> {
  const start = Date.now();
  try {
    const res = await request(url, "GET");
    await res.body?.cancel();
    return { url, up: res.ok, status: res.status, latencyMs: Date.now() - start };
  } catch (e) {
    return {
      url,
      up: false,
      status: null,
      latencyMs: Date.now() - start,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
