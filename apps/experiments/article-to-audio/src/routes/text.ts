import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ExtractedArticle, TextResponse } from "../types/article";
import { validateUrl } from "../lib/url";
import { fetchArticle, NotHtmlError } from "../lib/extract";
import { prepareArticle } from "../lib/text";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/text", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  let extracted: ExtractedArticle;
  try {
    extracted = await fetchArticle(url);
  } catch (err) {
    if (err instanceof NotHtmlError) return jsonError(c, err.message, "NO_CONTENT");
    const message = err instanceof Error ? err.message : "Failed to fetch page";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }

  const article = prepareArticle(extracted);
  if (!article.text) {
    return jsonError(c, "No readable article text found at url", "NO_CONTENT", 404);
  }

  const response: TextResponse = {
    url,
    title: article.title,
    text: article.text,
    chars: article.chars,
    chunks: article.chunks.length,
    truncated: article.truncated,
  };
  return jsonSuccess(c, response);
});

export default app;
