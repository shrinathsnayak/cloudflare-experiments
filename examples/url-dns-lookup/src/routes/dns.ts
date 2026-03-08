import { Hono } from "hono";
import type { Env } from "../types/env";
import { getHostnameFromUrl } from "../lib/url";
import { lookupDns } from "../lib/dns";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/dns", async (c) => {
  const urlParam = c.req.query("url");
  const hostname = getHostnameFromUrl(urlParam);
  if (!hostname) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  try {
    const result = await lookupDns(hostname);
    return jsonSuccess(c, result);
  } catch (err) {
    return jsonError(
      c,
      err instanceof Error ? err.message : "DNS lookup failed",
      "DNS_LOOKUP_ERROR",
      502
    );
  }
});

export default app;
