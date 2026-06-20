import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateDomain } from "../lib/url";
import { validateRecordType } from "../lib/record-type";
import { checkPropagation } from "../lib/doh";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/check", async (c) => {
  const domain = validateDomain(c.req.query("domain"));
  if (!domain) {
    return jsonError(c, "Missing or invalid query parameter: domain", "INVALID_DOMAIN");
  }

  const type = validateRecordType(c.req.query("type") ?? "A");
  if (!type) {
    return jsonError(
      c,
      "Invalid query parameter: type (allowed: A, AAAA, CNAME, MX, TXT, NS)",
      "INVALID_RECORD_TYPE"
    );
  }

  try {
    const result = await checkPropagation(domain, type);
    return jsonSuccess(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "DNS propagation check failed";
    return jsonError(c, message, "DNS_CHECK_ERROR", 502);
  }
});

export default app;
