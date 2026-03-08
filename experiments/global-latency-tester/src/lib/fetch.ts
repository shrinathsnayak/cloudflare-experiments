import { FETCH_TIMEOUT_MS } from "../constants/defaults";

export async function fetchWithTiming(url: string): Promise<{ latencyMs: number; statusCode: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "Cloudflare-Experiments-GlobalLatencyTester/1.0" },
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    return { latencyMs, statusCode: res.status };
  } finally {
    clearTimeout(timeoutId);
  }
}
