import { Hono, type Context } from "hono";
import type { Env } from "../types/env";
import type { FormRow, SubmitResponse, TurnstileStatus } from "../types/form";
import { parseSubmission } from "../lib/body";
import { hashIp } from "../lib/crypto";
import { notifyOwner } from "../lib/notify";
import { getForm, insertSubmission } from "../lib/store";
import { verifyTurnstile } from "../lib/turnstile";
import { jsonError, jsonSuccess } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

function respond(c: Context<{ Bindings: Env }>, form: FormRow, body: SubmitResponse) {
  const wantsHtml = (c.req.header("Accept") ?? "").includes("text/html");
  if (wantsHtml && form.redirect_url) {
    return c.redirect(form.redirect_url, 303);
  }
  return jsonSuccess(c, body, 201);
}

app.post("/f/:formId", async (c) => {
  const form = await getForm(c.env.DB, c.req.param("formId"));
  if (!form) return jsonError(c, "Form not found", "FORM_NOT_FOUND", 404);

  if (form.allowed_origin && c.req.header("Origin") !== form.allowed_origin) {
    return jsonError(c, "Origin is not allowed for this form", "ORIGIN_NOT_ALLOWED", 403);
  }

  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const { success } = await c.env.FORM_RATE_LIMITER.limit({ key: ip });
  if (!success) {
    return jsonError(c, "Too many submissions, try again later", "RATE_LIMITED", 429);
  }

  const parsed = await parseSubmission(c.req.raw);
  if (!parsed.ok) return jsonError(c, parsed.message, parsed.code, parsed.status);

  const secret = c.env.TURNSTILE_SECRET_KEY?.trim();
  const turnstile: TurnstileStatus = secret ? "passed" : "skipped";

  if (parsed.honeypotFilled) {
    return respond(c, form, { ok: true, id: null, turnstile, emailed: false });
  }

  if (secret) {
    if (!parsed.turnstileToken) {
      return jsonError(c, "Missing cf-turnstile-response field", "MISSING_TURNSTILE_TOKEN");
    }
    let verified: { success: boolean };
    try {
      verified = await verifyTurnstile(secret, parsed.turnstileToken, ip);
    } catch (error) {
      console.error("Turnstile siteverify failed", error);
      return jsonError(c, "Could not verify Turnstile token", "TURNSTILE_ERROR", 502);
    }
    if (!verified.success) {
      return jsonError(c, "Turnstile verification failed", "TURNSTILE_FAILED", 403);
    }
  }

  if (Object.keys(parsed.fields).length === 0) {
    return jsonError(c, "Submission has no fields", "EMPTY_SUBMISSION");
  }

  const id = await insertSubmission(c.env.DB, {
    formId: form.id,
    fields: parsed.fields,
    ipHash: ip === "unknown" ? null : await hashIp(ip, c.env.IP_HASH_SALT),
    userAgent: c.req.header("User-Agent")?.slice(0, 512) ?? null,
  });
  const emailed = await notifyOwner(c.env, form, parsed.fields);

  return respond(c, form, { ok: true, id, turnstile, emailed });
});

export default app;
