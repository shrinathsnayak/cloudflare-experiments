import { Hono } from "hono";
import type { Env } from "../types/env";
import { readSecretStatus, verifySecret } from "../lib/secret";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/secret/status", async (c) => {
  const status = await readSecretStatus(c.env.API_KEY);
  return jsonSuccess(c, status);
});

app.get("/secret/verify", async (c) => {
  const expected = c.req.query("expected");
  if (expected === undefined || expected === "") {
    return jsonError(c, "Missing or empty query parameter: expected", "MISSING_PARAM");
  }

  const match = await verifySecret(c.env.API_KEY, expected);
  return jsonSuccess(c, { match });
});

export default app;
