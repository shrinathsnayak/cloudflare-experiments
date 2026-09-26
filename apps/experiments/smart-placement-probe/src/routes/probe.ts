import { Hono } from "hono";
import type { Env } from "../types/env";
import { getRequestColo, probeUrl } from "../lib/probe";
import { validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/probe", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const colo = getRequestColo(c.req.raw);
  const result = await probeUrl(url, colo);
  return jsonSuccess(c, result);
});

export default app;
