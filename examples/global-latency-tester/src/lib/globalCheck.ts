import { GLOBAL_CHECK_CONCURRENCY, GLOBAL_CHECK_SUBREQUEST_TIMEOUT_MS } from "../constants/defaults";
import type { ColoLatencySummary, GlobalLatencyResponse, LatencyResponse } from "../types/latency";

type LatencyResponseJson = { url?: string; latencyMs?: number; colo?: string; statusCode?: number };

/**
 * Run multiple self-checks to the Worker's own /latency endpoint in parallel.
 * Each subrequest may be handled by a different edge colo; results are aggregated by colo.
 */
export async function runGlobalLatencyCheck(
  origin: string,
  targetUrl: string
): Promise<GlobalLatencyResponse> {
  const latencyUrl = `${origin}/latency?url=${encodeURIComponent(targetUrl)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GLOBAL_CHECK_SUBREQUEST_TIMEOUT_MS);

  const promises = Array.from({ length: GLOBAL_CHECK_CONCURRENCY }, () =>
    fetch(latencyUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "Cloudflare-Experiments-GlobalLatencyTester/1.0" },
    })
  );

  const results: LatencyResponse[] = [];
  try {
    const responses = await Promise.all(promises);
    clearTimeout(timeoutId);
    for (const res of responses) {
      const body = (await res.json().catch(() => ({}))) as LatencyResponseJson;
      if (body.url != null && typeof body.latencyMs === "number" && body.colo != null) {
        results.push({
          url: body.url,
          latencyMs: body.latencyMs,
          colo: String(body.colo),
          statusCode: typeof body.statusCode === "number" ? body.statusCode : res.status,
        });
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }

  const byColo = aggregateByColo(results);
  return {
    url: targetUrl,
    byColo,
    sampleCount: results.length,
  };
}

function aggregateByColo(results: LatencyResponse[]): ColoLatencySummary[] {
  const map = new Map<
    string,
    { latencies: number[]; statusCode: number }
  >();
  for (const r of results) {
    const key = r.colo;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { latencies: [r.latencyMs], statusCode: r.statusCode });
    } else {
      existing.latencies.push(r.latencyMs);
    }
  }
  const byColo: ColoLatencySummary[] = [];
  for (const [colo, { latencies, statusCode }] of map) {
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const sum = latencies.reduce((a, b) => a + b, 0);
    byColo.push({
      colo,
      minLatencyMs: Math.round(min),
      avgLatencyMs: Math.round(sum / latencies.length),
      maxLatencyMs: Math.round(max),
      count: latencies.length,
      statusCode,
    });
  }
  byColo.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
  return byColo;
}
