import { Hono } from "hono";
import type { Env } from "../types/env";
import type { VerifyRequest } from "../types/verify";
import { validateVerifyRequest, verifyWebhookSignature } from "../lib/verify";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/verify", async (c) => {
  let body: Partial<VerifyRequest>;
  try {
    body = await c.req.json<Partial<VerifyRequest>>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_JSON");
  }

  const request = validateVerifyRequest(body);
  if (!request) {
    return jsonError(
      c,
      "Missing or invalid fields: payload, secret, and signature are required",
      "INVALID_BODY"
    );
  }

  const result = await verifyWebhookSignature(request);
  if ("error" in result) {
    return jsonError(c, result.error, result.code);
  }

  return jsonSuccess(c, result);
});

export default app;
