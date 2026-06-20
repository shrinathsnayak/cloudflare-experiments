import { Hono } from "hono";
import type { Env } from "../types/env";
import { fetchWithEdgeCache } from "../lib/cache";
import { parseBypass, validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/fetch", async (c) => {
  const urlParam = c.req.query("url");
  const url = validateUrl(urlParam);
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const bypass = parseBypass(c.req.query("bypass"));

  try {
    const result = await fetchWithEdgeCache({
      url,
      cache: caches.default,
      bypass,
    });
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch URL";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
