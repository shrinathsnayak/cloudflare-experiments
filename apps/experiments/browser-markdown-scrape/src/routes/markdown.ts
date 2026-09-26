import { Hono } from "hono";
import type { Env } from "../types/env";
import type { MarkdownResponse } from "../types/browser";
import { extractMarkdown, runQuickAction } from "../lib/browser";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/markdown", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  try {
    const payload = await runQuickAction(c.env.BROWSER, "markdown", { url });
    const markdown = extractMarkdown(payload);
    const body: MarkdownResponse = { url, markdown };
    return jsonSuccess(c, body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Markdown conversion failed";
    return jsonError(c, message, "MARKDOWN_ERROR", 502);
  }
});

export default app;
