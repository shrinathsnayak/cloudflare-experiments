import { Hono } from "hono";
import type { Env } from "../types/env";
import type { LatencyResponse } from "../types/latency";
import { validateUrl } from "../lib/url";
import { fetchWithTiming } from "../lib/fetch";
import { runGlobalLatencyCheck } from "../lib/globalCheck";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/latency/global", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  try {
    const origin = new URL(c.req.url).origin;
    const result = await runGlobalLatencyCheck(origin, url);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Global latency check failed";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

app.get("/latency", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const { latencyMs, statusCode } = await fetchWithTiming(url);
    const cf = (c.req.raw as Request & { cf?: { colo?: string } }).cf;
    const colo = cf?.colo ?? "UNKNOWN";

    const response: LatencyResponse = {
      url,
      latencyMs: Math.round(latencyMs),
      colo,
      statusCode,
    };
    return jsonSuccess(c, response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch URL";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
