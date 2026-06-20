import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchPage } from "../lib/fetch";
import { buildDevtoolsResult } from "../lib/parse";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/devtools", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const { html, headers, statusCode, responseTimeMs, cookies } = await fetchPage(url);
    const result = buildDevtoolsResult(url, html, headers, statusCode, responseTimeMs, cookies);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch URL";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
