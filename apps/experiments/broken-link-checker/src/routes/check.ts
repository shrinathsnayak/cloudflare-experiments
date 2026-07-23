import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl, parseLimit } from "../lib/url";
import { fetchPageHtml, checkBrokenLinks } from "../lib/check";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/check", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const limit = parseLimit(c.req.query("limit"));
  const page = await fetchPageHtml(url);
  if (!page.ok) {
    const status = page.code === "NOT_HTML" ? 400 : 502;
    return jsonError(c, page.error, page.code, status);
  }

  const result = await checkBrokenLinks(page.url, page.html, limit);
  return jsonSuccess(c, result);
});

export default app;
