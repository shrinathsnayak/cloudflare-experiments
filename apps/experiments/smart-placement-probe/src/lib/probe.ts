import { FETCH_TIMEOUT_MS, SMART_PLACEMENT_HINT } from "../constants/defaults";
import type { ProbeResult } from "../types/probe";

export async function probeUrl(url: string, colo?: string): Promise<ProbeResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "Cloudflare-Experiments-SmartPlacementProbe/1.0" },
    });
    clearTimeout(timeoutId);
    return {
      url,
      status: res.status,
      latencyMs: Date.now() - start,
      cf: colo ? { colo } : {},
      workerPlacement: SMART_PLACEMENT_HINT,
    };
  } catch (e) {
    clearTimeout(timeoutId);
    const message = e instanceof Error ? e.message : "Fetch failed";
    return {
      url,
      status: 0,
      latencyMs: Date.now() - start,
      cf: colo ? { colo } : {},
      workerPlacement: SMART_PLACEMENT_HINT,
      error: message,
    };
  }
}

export function getRequestColo(request: Request): string | undefined {
  const cf = (request as Request & { cf?: { colo?: string } }).cf;
  return typeof cf?.colo === "string" ? cf.colo : undefined;
}
