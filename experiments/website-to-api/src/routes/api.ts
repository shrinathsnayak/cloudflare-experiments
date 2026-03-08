import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchHtml } from "../lib/fetch";
import { parseToStructured } from "../lib/parse";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/api", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const html = await fetchHtml(url);
    const data = parseToStructured(html, url);
    return jsonSuccess(c, data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch URL";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
