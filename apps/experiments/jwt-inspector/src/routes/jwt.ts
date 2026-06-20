import { Hono } from "hono";
import type { Env } from "../types/env";
import type { DecodeResponse, IssueResponse, VerifyResponse } from "../types/env";
import { decodeJwt, issueHs256Token, validateToken, verifyJwt } from "../lib/jwt";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.post("/decode", async (c) => {
  let body: { token?: unknown };
  try {
    body = await c.req.json<{ token?: unknown }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const token = validateToken(body.token);
  if (!token) {
    return jsonError(c, "Missing or invalid token", "INVALID_TOKEN");
  }

  try {
    const decoded = decodeJwt(token);
    const response: DecodeResponse = decoded;
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Decode failed";
    return jsonError(c, message, "DECODE_ERROR");
  }
});

app.post("/verify", async (c) => {
  let body: { token?: unknown; secret?: unknown; publicKey?: unknown };
  try {
    body = await c.req.json<{ token?: unknown; secret?: unknown; publicKey?: unknown }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const token = validateToken(body.token);
  if (!token) {
    return jsonError(c, "Missing or invalid token", "INVALID_TOKEN");
  }

  const secret = typeof body.secret === "string" ? body.secret : undefined;
  const publicKey = typeof body.publicKey === "string" ? body.publicKey : undefined;
  if (!secret && !publicKey) {
    return jsonError(c, "Provide secret (HS256) or publicKey PEM (RS256)", "MISSING_KEY");
  }

  try {
    const result = await verifyJwt(token, { secret, publicKey });
    const response: VerifyResponse = result;
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return jsonError(c, message, "VERIFY_ERROR");
  }
});

app.post("/issue", async (c) => {
  let body: { secret?: unknown; subject?: unknown; expiresInSeconds?: unknown };
  try {
    body = await c.req.json<{
      secret?: unknown;
      subject?: unknown;
      expiresInSeconds?: unknown;
    }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const secret = typeof body.secret === "string" && body.secret.length >= 8 ? body.secret : null;
  if (!secret) {
    return jsonError(c, "Missing or invalid secret (min 8 chars)", "INVALID_SECRET");
  }

  const subject =
    typeof body.subject === "string" && body.subject.trim() ? body.subject.trim() : "test-user";
  const expiresIn =
    typeof body.expiresInSeconds === "number" && body.expiresInSeconds > 0
      ? body.expiresInSeconds
      : 3600;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: subject,
    iat: now,
    exp: now + expiresIn,
    iss: "jwt-inspector-demo",
  };

  try {
    const token = await issueHs256Token(payload, secret);
    const response: IssueResponse = { token, payload };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Issue failed";
    return jsonError(c, message, "ISSUE_ERROR", 502);
  }
});

export default app;
