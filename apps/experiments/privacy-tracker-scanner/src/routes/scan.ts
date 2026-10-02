import { Hono } from "hono";
import type { Env } from "../types/env";
import type { PageCapture } from "../types/scan";
import { capturePage } from "../lib/browser";
import { buildScanReport } from "../lib/report";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/scan", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  let capture: PageCapture;
  try {
    capture = await capturePage(c.env.BROWSER, url);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Browser scan failed";
    return jsonError(c, message, "BROWSER_ERROR", 502);
  }

  return jsonSuccess(c, buildScanReport(url, capture));
});

export default app;
