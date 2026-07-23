import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchFeed } from "../lib/fetch";
import { parseFeedXml } from "../lib/parse";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/parse", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const fetched = await fetchFeed(url);
  if (!fetched.ok) {
    return jsonError(c, fetched.error, "FETCH_ERROR", 502);
  }

  const feed = parseFeedXml(fetched.url, fetched.body);
  if (feed.format === "unknown") {
    return jsonError(c, "URL did not return a recognizable RSS or Atom feed", "NOT_FEED", 400);
  }

  return jsonSuccess(c, feed);
});

export default app;
