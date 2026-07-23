import { FETCH_TIMEOUT_MS, USER_AGENT } from "../constants/defaults";
import { headersToRecord } from "./url";

export type FetchHeadersResult =
  | { ok: true; url: string; headers: Record<string, string>; method: "HEAD" | "GET" }
  | { ok: false; error: string };

function shouldRetryWithGet(status: number): boolean {
  return status === 405 || status === 501 || status === 400 || status === 403;
}

async function fetchWithMethod(
  url: string,
  method: "HEAD" | "GET",
  signal: AbortSignal
): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "follow",
    signal,
    headers: { "User-Agent": USER_AGENT },
  });
}

/**
 * Fetches response headers using HEAD, falling back to GET when needed.
 */
export async function fetchResponseHeaders(url: string): Promise<FetchHeadersResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let method: "HEAD" | "GET" = "HEAD";
    let response = await fetchWithMethod(url, method, controller.signal);

    if (shouldRetryWithGet(response.status)) {
      method = "GET";
      response = await fetchWithMethod(url, method, controller.signal);
    }

    clearTimeout(timeoutId);
    return {
      ok: true,
      url: response.url || url,
      headers: headersToRecord(response.headers),
      method,
    };
  } catch (e) {
    clearTimeout(timeoutId);
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
