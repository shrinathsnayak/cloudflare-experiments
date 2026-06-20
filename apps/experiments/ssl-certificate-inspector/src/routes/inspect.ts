import { Hono } from "hono";
import type { Env } from "../types/env";
import type { InspectResponse } from "../types/env";
import { fetchCertificateFromCt, probeHttps } from "../lib/cert";
import { validateDomain } from "../lib/domain";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/inspect", async (c) => {
  const domain = validateDomain(c.req.query("domain"));
  if (!domain) {
    return jsonError(c, "Missing or invalid query parameter: domain", "INVALID_DOMAIN");
  }

  try {
    const [certificate, probe] = await Promise.all([
      fetchCertificateFromCt(domain),
      probeHttps(domain),
    ]);

    const cf = c.req.raw.cf as { tlsVersion?: string } | undefined;
    const response: InspectResponse = {
      domain,
      reachable: probe.reachable,
      tlsVersion: cf?.tlsVersion ?? probe.tlsVersion,
      certificate,
      source: "certificate-transparency",
      note: "Certificate metadata comes from Certificate Transparency logs (crt.sh). Live TLS handshake details from Workers are limited; reachability is probed via HTTPS HEAD.",
    };
    return jsonSuccess(c, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Inspection failed";
    return jsonError(c, message, "INSPECT_ERROR", 502);
  }
});

export default app;
