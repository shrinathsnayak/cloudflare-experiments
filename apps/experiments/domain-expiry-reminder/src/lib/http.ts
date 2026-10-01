import { USER_AGENT } from "../constants/defaults";

export async function fetchJson<T>(
  url: string,
  timeoutMs: number,
  accept = "application/json"
): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: accept, "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  }
  return (await res.json()) as T;
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.name === "TimeoutError" ? "Request timed out" : error.message;
  }
  return fallback;
}
