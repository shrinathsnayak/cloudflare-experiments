import { Hono } from "hono";
import type { Env } from "../types/env";
import type { CreateDomainBody, DomainResponse, DomainRow } from "../types/domain";
import { parseId, validateDomain, validateEmail } from "../lib/validate";
import { checkDomain } from "../lib/expiry";
import { createDomain, deleteDomain, getDomain, saveDomainStatus } from "../lib/store";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function toDomainResponse(row: DomainRow): DomainResponse {
  return {
    id: row.id,
    domain: row.domain,
    alertEmail: row.alert_email,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  };
}

app.post("/domains", async (c) => {
  let body: CreateDomainBody;
  try {
    body = (await c.req.json()) as CreateDomainBody;
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const domain = validateDomain(body.domain);
  if (!domain) {
    return jsonError(
      c,
      "Missing or invalid body field: domain (bare hostname, e.g. example.com)",
      "INVALID_DOMAIN"
    );
  }

  const alertEmail = validateEmail(body.alertEmail);
  if (!alertEmail) {
    return jsonError(c, "Missing or invalid body field: alertEmail", "INVALID_EMAIL");
  }

  const row = await createDomain(c.env.DB, domain, alertEmail);
  return jsonSuccess(c, toDomainResponse(row), 201);
});

app.get("/domains/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return jsonError(c, "Missing or invalid domain id", "INVALID_ID");

  const row = await getDomain(c.env.DB, id);
  if (!row) return jsonError(c, "Domain not found", "NOT_FOUND", 404);

  const status = await checkDomain(row.domain);
  await saveDomainStatus(c.env.DB, row.id, status);
  return jsonSuccess(c, { ...toDomainResponse(row), status });
});

app.delete("/domains/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (!id) return jsonError(c, "Missing or invalid domain id", "INVALID_ID");

  const removed = await deleteDomain(c.env.DB, id);
  if (!removed) return jsonError(c, "Domain not found", "NOT_FOUND", 404);
  return jsonSuccess(c, { id, removed: true });
});

export default app;
