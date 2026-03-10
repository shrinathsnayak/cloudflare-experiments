import { Hono } from "hono";
import type { Env } from "../types/env";
import type { TagsResponse } from "../types/tags";
import { validateUrl } from "../lib/url";
import { fetchHtml } from "../lib/fetch";
import { getTitle, getBodyText } from "../lib/html";
import { generateTagsWithAi } from "../lib/ai";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/tags", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const html = await fetchHtml(url);
    const title = getTitle(html);
    const bodyText = getBodyText(html, 6000);
    const tags = await generateTagsWithAi(c.env, (bodyText.trim() || title) ?? "", title);
    const response: TagsResponse = { tags };
    return jsonSuccess(c, response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch or generate tags";
    return jsonError(c, message, "FETCH_OR_AI_ERROR", 502);
  }
});

export default app;
