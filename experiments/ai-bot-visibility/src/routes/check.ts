import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchPage, fetchRobotsTxt } from "../lib/fetch";
import { parseRobotsTxt } from "../lib/robots";
import { buildVisibilityResponse } from "../lib/visibility";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/check", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url)
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");

  try {
    const parsed = new URL(url);
    const origin = parsed.origin;
    const path = parsed.pathname || "/";

    const [pageResult, robotsBody] = await Promise.all([
      fetchPage(url),
      fetchRobotsTxt(origin),
    ]);

    const rules = robotsBody ? parseRobotsTxt(robotsBody) : new Map();
    const response = buildVisibilityResponse(
      url,
      path,
      rules,
      pageResult.html,
      pageResult.headers
    );
    return jsonSuccess(c, response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch URL";
    return jsonError(c, message, "FETCH_ERROR", 502);
  }
});

export default app;
