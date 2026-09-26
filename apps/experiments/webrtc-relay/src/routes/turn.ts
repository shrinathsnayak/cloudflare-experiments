import { Hono } from "hono";
import type { Context } from "hono";
import type { Env } from "../types/env";
import { demoCredentials, fetchTurnCredentials, isConfigured, parseTtl } from "../lib/turn";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

async function handleCredentials(c: Context<{ Bindings: Env }>) {
  const ttl = parseTtl(c.req.query("ttl"));
  if (ttl === null) {
    return jsonError(c, "ttl must be an integer between 60 and 86400", "INVALID_TTL");
  }

  const appId = c.env.REALTIME_APP_ID?.trim() ?? "";
  const token = c.env.TURN_API_TOKEN?.trim() ?? "";

  if (!isConfigured(appId, token)) {
    return jsonSuccess(c, demoCredentials(ttl));
  }

  try {
    const result = await fetchTurnCredentials(appId, token, ttl);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "TURN credential fetch failed";
    return jsonError(c, message, "TURN_API_ERROR", 502);
  }
}

app.get("/turn-credentials", (c) => handleCredentials(c));
app.get("/ice-servers", (c) => handleCredentials(c));

export default app;
