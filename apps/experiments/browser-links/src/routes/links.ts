import { Hono } from "hono";
import type { Env } from "../types/env";
import { extractPageLinks } from "../lib/browser";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/links", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  try {
    const result = await extractPageLinks(c.env.BROWSER, url);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to extract links";
    return jsonError(c, message, "LINKS_ERROR", 502);
  }
});

export default app;
