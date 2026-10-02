import { Hono, type MiddlewareHandler } from "hono";
import type { Env } from "../types/env";
import type {
  CreateFormBody,
  FormFields,
  FormResponse,
  FormRow,
  SubmissionResponse,
} from "../types/form";
import { createFormId, isAdmin } from "../lib/crypto";
import { createForm, getForm, listSubmissions } from "../lib/store";
import { validateEmail, validateOrigin, validateUrl } from "../lib/url";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function toFormResponse(row: FormRow, baseUrl: string): FormResponse {
  return {
    id: row.id,
    ownerEmail: row.owner_email,
    allowedOrigin: row.allowed_origin,
    redirectUrl: row.redirect_url,
    endpoint: `${new URL(baseUrl).origin}/f/${row.id}`,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  };
}

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

const requireAdmin: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (!(await isAdmin(c.req.header("Authorization"), c.env.ADMIN_TOKEN))) {
    return jsonError(c, "Missing or invalid admin bearer token", "UNAUTHORIZED", 401);
  }
  await next();
};

app.use("/forms", requireAdmin);
app.use("/forms/*", requireAdmin);

app.post("/forms", async (c) => {
  let body: CreateFormBody;
  try {
    body = (await c.req.json()) as CreateFormBody;
  } catch {
    return jsonError(c, "Invalid or missing JSON body", "INVALID_BODY");
  }

  const ownerEmail = validateEmail(body.ownerEmail);
  if (!ownerEmail) {
    return jsonError(c, "Missing or invalid body field: ownerEmail", "INVALID_EMAIL");
  }

  let allowedOrigin: string | null = null;
  if (!isMissing(body.allowedOrigin)) {
    allowedOrigin = validateOrigin(
      typeof body.allowedOrigin === "string" ? body.allowedOrigin : undefined
    );
    if (!allowedOrigin) {
      return jsonError(
        c,
        "Invalid body field: allowedOrigin (http or https origin)",
        "INVALID_ORIGIN"
      );
    }
  }

  let redirectUrl: string | null = null;
  if (!isMissing(body.redirectUrl)) {
    redirectUrl = validateUrl(typeof body.redirectUrl === "string" ? body.redirectUrl : undefined);
    if (!redirectUrl) {
      return jsonError(c, "Invalid body field: redirectUrl (http or https only)", "INVALID_URL");
    }
  }

  const row = await createForm(c.env.DB, {
    id: createFormId(),
    ownerEmail,
    allowedOrigin,
    redirectUrl,
  });
  return jsonSuccess(c, toFormResponse(row, c.req.url), 201);
});

app.get("/forms/:id/submissions", async (c) => {
  const id = c.req.param("id");
  const form = await getForm(c.env.DB, id);
  if (!form) return jsonError(c, "Form not found", "FORM_NOT_FOUND", 404);

  const rows = await listSubmissions(c.env.DB, id);
  const submissions: SubmissionResponse[] = rows.map((row) => ({
    id: row.id,
    fields: JSON.parse(row.fields) as FormFields,
    ipHash: row.ip_hash,
    userAgent: row.user_agent,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  }));

  return jsonSuccess(c, { form: toFormResponse(form, c.req.url), submissions });
});

export default app;
