import { Hono } from "hono";
import type { Env } from "../types/env";
import { collectPageMetrics } from "../lib/browser";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/metrics", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  try {
    const result = await collectPageMetrics(c.env.BROWSER, url);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to collect page metrics";
    return jsonError(c, message, "METRICS_ERROR", 502);
  }
});

export default app;
