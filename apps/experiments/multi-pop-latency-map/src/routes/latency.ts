import { Hono } from "hono";
import type { Env } from "../types/env";
import type { LatencyResponse } from "../types/env";
import { POP_LIMITATION, POP_TIP } from "../constants/defaults";
import { getCfLocation, validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/latency", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cf: { cacheTtl: 0, cacheEverything: false },
    });
    const cf = c.req.raw.cf as { colo?: string; city?: string; country?: string } | undefined;
    const location = getCfLocation(cf);
    const result: LatencyResponse = {
      url,
      responseTimeMs: Date.now() - started,
      statusCode: response.status,
      ...location,
      timestamp: new Date().toISOString(),
      limitation: POP_LIMITATION,
      tip: POP_TIP,
    };
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
