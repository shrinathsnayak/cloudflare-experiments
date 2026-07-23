import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateDomain } from "../lib/domain";
import { checkEmailAuth } from "../lib/analyze";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/check", async (c) => {
  const domain = validateDomain(c.req.query("domain"));
  if (!domain) {
    return jsonError(
      c,
      "Missing or invalid query parameter: domain (hostname or https URL)",
      "INVALID_DOMAIN"
    );
  }

  try {
    const result = await checkEmailAuth(domain);
    return jsonSuccess(c, result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "DNS lookup failed";
    return jsonError(c, message, "DNS_ERROR", 502);
  }
});

export default app;
