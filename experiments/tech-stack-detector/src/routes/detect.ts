import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchPage } from "../lib/fetch";
import { detectTechStack } from "../lib/detect";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/detect", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const { html, headers } = await fetchPage(url);
    const result = detectTechStack(html, headers);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch URL";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
