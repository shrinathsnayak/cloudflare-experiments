import { Hono } from "hono";
import type { Env } from "../types/env";
import { jsonSuccess, jsonError } from "../utils/response";
import { getRadarFact } from "../lib/radar";

const app = new Hono<{ Bindings: Env }>();

app.get("/radar", async (c) => {
  const domain = c.req.query("domain");
  const asn = c.req.query("asn");

  if (!domain && !asn) {
    return jsonError(
      c,
      "Missing required query parameter: domain or asn",
      "MISSING_PARAMETER",
      400
    );
  }

  if (domain && asn) {
    return jsonError(c, "Provide only one of domain or asn", "INVALID_PARAMETER", 400);
  }

  try {
    const result = await getRadarFact(domain, asn);
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(c, message, "RADAR_ERROR", 502);
  }
});

export default app;
