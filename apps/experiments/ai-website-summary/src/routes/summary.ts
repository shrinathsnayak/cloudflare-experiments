import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SummaryResponse } from "../types/summary";
import { validateUrl } from "../lib/url";
import { fetchHtml } from "../lib/fetch";
import { getTitle, getBodyText } from "../lib/html";
import { summarizeWithAi } from "../lib/ai";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/summary", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const html = await fetchHtml(url);
    const title = getTitle(html);
    const bodyText = getBodyText(html, 6000);
    if (!bodyText.trim()) {
      return jsonSuccess<SummaryResponse>(c, { title, summary: "No extractable text content." });
    }
    const summary = await summarizeWithAi(c.env, bodyText, title);
    const response: SummaryResponse = { title, summary };
    return jsonSuccess(c, response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch or summarize";
    return jsonError(c, message, "FETCH_OR_AI_ERROR", 502);
  }
});

export default app;
