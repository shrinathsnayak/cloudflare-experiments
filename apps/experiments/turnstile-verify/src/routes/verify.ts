import { Hono } from "hono";
import type { Env } from "../types/env";
import type { VerifyRequest } from "../types/verify";
import { validateToken } from "../lib/token";
import { verifyTurnstileToken } from "../lib/verify";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/verify", async (c) => {
  const secret = c.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return jsonError(c, "Turnstile secret key is not configured", "MISSING_SECRET", 502);
  }

  let body: VerifyRequest;
  try {
    body = await c.req.json<VerifyRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const token = validateToken(body.token);
  if (!token) {
    return jsonError(c, "Missing or invalid field: token", "INVALID_TOKEN");
  }

  try {
    const result = await verifyTurnstileToken(secret, token);
    return jsonSuccess(c, result);
  } catch {
    return jsonError(c, "Failed to verify Turnstile token", "VERIFY_ERROR", 502);
  }
});

export default app;
