import { Hono } from "hono";
import type { Env } from "../types/env";
import type { CorsTestRequest } from "../types/cors";
import { validateUrl } from "../lib/url";
import { runCorsPreflightTest, validateCorsTestRequest } from "../lib/cors";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/test", async (c) => {
  let body: Partial<CorsTestRequest>;
  try {
    body = await c.req.json<Partial<CorsTestRequest>>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_JSON");
  }

  const request = validateCorsTestRequest(body);
  if (!request) {
    return jsonError(
      c,
      "Missing or invalid fields: url, origin, and method are required",
      "INVALID_BODY"
    );
  }

  const url = validateUrl(request.url);
  if (!url) {
    return jsonError(c, "Invalid url (http or https only)", "INVALID_URL");
  }
  request.url = url;

  try {
    const result = await runCorsPreflightTest(request);
    return jsonSuccess(c, result);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Preflight request timed out"
        : err instanceof Error
          ? err.message
          : "Preflight request failed";
    return jsonError(c, message, "PREFLIGHT_ERROR", 502);
  }
});

export default app;
