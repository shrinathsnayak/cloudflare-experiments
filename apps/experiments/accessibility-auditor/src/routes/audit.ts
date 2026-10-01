import { Hono } from "hono";
import type { Env } from "../types/env";
import type { AuditReport } from "../types/audit";
import { runAxeAudit } from "../lib/browser";
import { summarizeAxeResults } from "../lib/report";
import { suggestAltTexts } from "../lib/alt-text";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/audit", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  const altTextParam = c.req.query("altText");
  if (altTextParam !== undefined && altTextParam !== "true" && altTextParam !== "false") {
    return jsonError(c, "Query parameter altText must be true or false", "INVALID_QUERY");
  }

  let result: Awaited<ReturnType<typeof runAxeAudit>>;
  try {
    result = await runAxeAudit(c.env.BROWSER, url);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Browser audit failed";
    return jsonError(c, message, "BROWSER_ERROR", 502);
  }

  const report: AuditReport = summarizeAxeResults(url, result.axe);
  if (altTextParam === "true") {
    report.altSuggestions = await suggestAltTexts(c.env.AI, result.imagesMissingAlt);
  }
  return jsonSuccess(c, report);
});

export default app;
