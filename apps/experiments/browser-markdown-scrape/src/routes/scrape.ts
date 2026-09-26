import { Hono } from "hono";
import type { Env } from "../types/env";
import type { ScrapeResponse, ScrapeSelectorResult } from "../types/browser";
import { extractScrapeResults, runQuickAction } from "../lib/browser";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/scrape", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const selector = c.req.query("selector")?.trim();
  if (!selector) {
    return jsonError(c, "Missing query parameter: selector", "MISSING_SELECTOR");
  }

  try {
    const payload = await runQuickAction(c.env.BROWSER, "scrape", {
      url,
      elements: [{ selector }],
    });
    const results = extractScrapeResults(payload) as ScrapeSelectorResult[];
    const body: ScrapeResponse = { url, results };
    return jsonSuccess(c, body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scrape failed";
    return jsonError(c, message, "SCRAPE_ERROR", 502);
  }
});

export default app;
