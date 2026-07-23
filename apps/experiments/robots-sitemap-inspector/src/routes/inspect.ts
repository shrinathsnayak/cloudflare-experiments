import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { inspectRobotsAndSitemaps } from "../lib/inspect";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/inspect", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  try {
    const result = await inspectRobotsAndSitemaps(url);
    // Still return 200 when robots.txt is missing; include error in payload.
    // Only treat unexpected throws as FETCH_ERROR.
    if (!result.robots.present && result.robots.error?.startsWith("HTTP 5")) {
      return jsonError(c, result.robots.error, "FETCH_ERROR", 502);
    }
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to inspect robots/sitemaps";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
