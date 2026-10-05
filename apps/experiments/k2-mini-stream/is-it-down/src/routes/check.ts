import { Hono } from "hono";
import type { Env } from "../types/env";
import type { CheckResponse } from "../types/check";
import { validateUrl } from "../lib/url";
import { fetchWithTiming } from "../lib/fetch";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/check", async (c) => {
  const urlParam = c.req.query("url");
  const url = validateUrl(urlParam);
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const result = await fetchWithTiming(url);
  const cf = (c.req.raw as Request & { cf?: { colo?: string } }).cf;
  const colo = cf?.colo ?? undefined;

  const response: CheckResponse = result.ok
    ? {
        status: "reachable",
        responseTime: Math.round(result.responseTimeMs),
        statusCode: result.statusCode,
        ...(colo && { colo }),
      }
    : {
        status: "unreachable",
        responseTime: Math.round(result.responseTimeMs),
        statusCode: result.statusCode || undefined,
        ...(colo && { colo }),
        error: result.error,
      };

  return jsonSuccess(c, response);
});

export default app;
