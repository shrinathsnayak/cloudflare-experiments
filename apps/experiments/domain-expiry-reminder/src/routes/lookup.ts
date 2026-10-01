import { Hono } from "hono";
import type { Env } from "../types/env";
import { validateDomain } from "../lib/validate";
import { checkDomain } from "../lib/expiry";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/lookup", async (c) => {
  const domain = validateDomain(c.req.query("domain"));
  if (!domain) {
    return jsonError(
      c,
      "Missing or invalid query parameter: domain (bare hostname, e.g. example.com)",
      "INVALID_DOMAIN"
    );
  }

  return jsonSuccess(c, await checkDomain(domain));
});

export default app;
