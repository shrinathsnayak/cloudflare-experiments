import { Hono } from "hono";
import type { Env } from "../types/env";
import type { TestResponse } from "../types/test";
import { validateUrl } from "../lib/url";
import { fetchWithTiming } from "../lib/fetch";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/test", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  const result = await fetchWithTiming(url);
  const response: TestResponse = {
    status: result.statusCode,
    latency: Math.round(result.responseTimeMs),
    ok: result.ok,
    ...(result.error && { error: result.error }),
  };
  return jsonSuccess(c, response);
});

export default app;
