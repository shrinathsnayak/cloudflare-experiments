import { FETCH_TIMEOUT_MS } from "../constants/defaults";

export interface FetchResult {
  ok: boolean;
  statusCode: number;
  responseTimeMs: number;
  error?: string;
}

/**
 * Fetches a URL and returns status and response time.
 * Uses AbortController for timeout.
 */
export async function fetchWithTiming(url: string): Promise<FetchResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "Cloudflare-Experiments-IsItDown/1.0" },
    });
    const responseTimeMs = Date.now() - start;
    clearTimeout(timeoutId);
    return {
      ok: res.ok,
      statusCode: res.status,
      responseTimeMs,
    };
  } catch (e) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - start;
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      ok: false,
      statusCode: 0,
      responseTimeMs,
      error: message,
    };
  }
}
