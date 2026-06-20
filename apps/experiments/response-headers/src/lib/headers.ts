import { USER_AGENT } from "../constants/defaults";
import type { HeadersResponse } from "../types/headers";
import { headersToRecord, shouldRetryWithGet } from "./url";

async function fetchWithMethod(url: string, method: "HEAD" | "GET"): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "follow",
    headers: { "User-Agent": USER_AGENT },
  });
}

export async function inspectResponseHeaders(url: string): Promise<HeadersResponse> {
  let method: "HEAD" | "GET" = "HEAD";
  let response = await fetchWithMethod(url, method);

  if (shouldRetryWithGet(response.status)) {
    method = "GET";
    response = await fetchWithMethod(url, method);
  }

  return {
    url: response.url,
    statusCode: response.status,
    statusText: response.statusText,
    method,
    headers: headersToRecord(response.headers),
  };
}
