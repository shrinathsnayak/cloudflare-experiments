import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateUrl } from "../lib/url";
import { fetchResponseHeaders } from "../lib/fetch";
import { gradeHeaders } from "../lib/grade";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/grade", async (c) => {
  const url = validateUrl(c.req.query("url"));
  if (!url) {
    return jsonError(c, "Missing or invalid query parameter: url", "INVALID_URL");
  }

  const fetched = await fetchResponseHeaders(url);
  if (!fetched.ok) {
    return jsonError(c, fetched.error, "FETCH_ERROR", 502);
  }

  return jsonSuccess(c, gradeHeaders(fetched.url, fetched.headers));
});

export default app;
