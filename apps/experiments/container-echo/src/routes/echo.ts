import { Hono } from "hono";
import type { Env } from "../types/env";
import { echoMessage, validateMessage } from "../lib/echo";
import { jsonError, jsonSuccess } from "../utils/response";

const echoRoutes = new Hono<{ Bindings: Env }>();

echoRoutes.post("/echo", async (c) => {
  const contentType = c.req.header("content-type") ?? "";
  let message: string;

  try {
    if (contentType.includes("application/json")) {
      const body = await c.req.json<{ message?: string; echo?: string }>();
      message = body.message ?? body.echo ?? JSON.stringify(body);
    } else {
      message = await c.req.text();
    }
  } catch {
    return jsonError(c, "Invalid request body", "INVALID_BODY");
  }

  const validated = validateMessage(message);
  if (!validated) {
    return jsonError(c, "Missing or invalid body (non-empty, max 10000 chars)", "INVALID_BODY");
  }

  try {
    const result = await echoMessage(c.env, validated);
    return jsonSuccess(c, result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Container echo failed";
    return jsonError(c, msg, "ECHO_ERROR", 502);
  }
});

export default echoRoutes;
