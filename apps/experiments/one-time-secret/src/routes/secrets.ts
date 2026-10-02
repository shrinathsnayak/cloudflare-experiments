import { Hono } from "hono";
import type { Env } from "../types/env";
import type {
  CreateSecretRequest,
  CreateSecretResponse,
  SecretStatusResponse,
} from "../types/secret";
import { encryptSecret, generateId } from "../lib/crypto";
import { isValidId, isValidKey, validateSecret, validateTtl } from "../lib/validate";
import { jsonError, jsonSuccess } from "../utils/response";
import { MAX_SECRET_LENGTH, MAX_TTL_SECONDS, MIN_TTL_SECONDS } from "../constants/defaults";

const app = new Hono<{ Bindings: Env }>();

const vault = (env: Env, id: string) => env.SECRETS.get(env.SECRETS.idFromName(id));

app.post("/secrets", async (c) => {
  let body: CreateSecretRequest;
  try {
    body = await c.req.json<CreateSecretRequest>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const secret = validateSecret(body.secret);
  if (secret === null) {
    return jsonError(
      c,
      `secret must be a non-empty string (max ${MAX_SECRET_LENGTH} chars)`,
      "INVALID_SECRET"
    );
  }
  const ttlSeconds = validateTtl(body.ttlSeconds);
  if (ttlSeconds === null) {
    return jsonError(
      c,
      `ttlSeconds must be an integer between ${MIN_TTL_SECONDS} and ${MAX_TTL_SECONDS}`,
      "INVALID_TTL"
    );
  }

  const id = generateId();
  const { key, ciphertext, iv } = await encryptSecret(secret);
  const expiresAt = Date.now() + ttlSeconds * 1000;
  await vault(c.env, id).store({ ciphertext, iv, expiresAt });

  const response: CreateSecretResponse = {
    id,
    key,
    url: `${new URL(c.req.url).origin}/s/${id}#${key}`,
    expiresAt: new Date(expiresAt).toISOString(),
  };
  return jsonSuccess(c, response, 201);
});

app.get("/secrets/:id", async (c) => {
  const id = c.req.param("id");
  if (!isValidId(id)) return jsonError(c, "Invalid secret id", "INVALID_ID");

  const { exists, expiresAt } = await vault(c.env, id).status();
  const response: SecretStatusResponse = {
    id,
    exists,
    expiresAt: expiresAt === null ? null : new Date(expiresAt).toISOString(),
  };
  return jsonSuccess(c, response);
});

app.post("/secrets/:id/reveal", async (c) => {
  const id = c.req.param("id");
  if (!isValidId(id)) return jsonError(c, "Invalid secret id", "INVALID_ID");

  let body: { key?: unknown };
  try {
    body = await c.req.json<{ key?: unknown }>();
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }
  if (!isValidKey(body.key)) return jsonError(c, "Missing or malformed key", "INVALID_KEY");

  const result = await vault(c.env, id).reveal(body.key);
  c.header("Cache-Control", "no-store");
  if (!result.ok) {
    return result.code === "NOT_FOUND"
      ? jsonError(c, "Secret not found, already viewed, or expired", "NOT_FOUND", 404)
      : jsonError(c, "Key does not decrypt this secret", "INVALID_KEY");
  }
  return jsonSuccess(c, { secret: result.secret });
});

export default app;
