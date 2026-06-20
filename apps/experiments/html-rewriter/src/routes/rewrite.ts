import { Hono } from "hono";
import type { Env } from "../types/env";
import type { HtmlStats, TransformResponse } from "../types/rewrite";
import { validateUrl } from "../lib/url";
import { fetchHtml } from "../lib/fetch";
import { extractHtmlStats, transformHtmlAsync } from "../lib/rewriter";
import { DEFAULT_BANNER } from "../constants/defaults";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/stats", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const html = await fetchHtml(url);
    const stats: HtmlStats = await extractHtmlStats(html);
    return jsonSuccess(c, { url, ...stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze HTML";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

app.get("/transform", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  const banner = c.req.query("banner")?.trim() || DEFAULT_BANNER;

  try {
    const html = await fetchHtml(url);
    const transformed = await transformHtmlAsync(html, banner);
    const response: TransformResponse = { url, banner, html: transformed };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to transform HTML";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
