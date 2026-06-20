import { Hono } from "hono";
import type { Env } from "../types/env";
import { RATE_LIMIT } from "../constants/defaults";
import { getUsage, recordUsage, resolveClientKey, validateKey } from "../lib/usage";
import { jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/limited", async (c) => {
  const key = resolveClientKey(c.req.raw, c.req.query("key"));
  const { success } = await c.env.RATE_LIMITER.limit({ key });
  await recordUsage(c.env, key, success);

  if (!success) {
    return c.json(
      {
        error: "Rate limit exceeded",
        code: "RATE_LIMITED",
        key,
        retryAfterSeconds: RATE_LIMIT.periodSeconds,
      },
      429,
      { "Retry-After": String(RATE_LIMIT.periodSeconds) }
    );
  }

  return jsonSuccess(c, {
    message: "Request allowed",
    key,
    limit: RATE_LIMIT.limit,
    periodSeconds: RATE_LIMIT.periodSeconds,
  });
});

app.get("/status", async (c) => {
  const key = validateKey(c.req.query("key")) ?? resolveClientKey(c.req.raw, null);
  const usage = await getUsage(c.env, key);
  return jsonSuccess(c, {
    key,
    config: RATE_LIMIT,
    usage,
    note: "Native Rate Limiting binding enforces limits per PoP. Usage counters here are for demo visualization only.",
  });
});

export default app;
