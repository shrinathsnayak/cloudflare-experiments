import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchHtml } from "../lib/fetch";
import { htmlToMarkdown } from "../lib/to-markdown";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/markdown", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const page = await fetchHtml(url);
  if (!page.ok) {
    const status = page.code === "NOT_HTML" ? 400 : 502;
    return jsonError(c, page.error, page.code, status);
  }

  return jsonSuccess(c, htmlToMarkdown(page.url, page.html));
});

export default app;
