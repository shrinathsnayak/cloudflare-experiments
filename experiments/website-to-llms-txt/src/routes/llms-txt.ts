import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchHtml } from "../lib/fetch";
import { htmlToLlmsTxt } from "../lib/to-llms-txt";
import { jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/llms.txt", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const html = await fetchHtml(url);
    const llmsTxt = htmlToLlmsTxt(html, url);
    return c.text(llmsTxt, 200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch URL";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
