import { Hono } from "hono";
import type { Env } from "../types/env";
import { inspectResponseHeaders } from "../lib/headers";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/headers", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  try {
    const result = await inspectResponseHeaders(url);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch headers";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
