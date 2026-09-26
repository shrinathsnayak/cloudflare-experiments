import { Hono } from "hono";
import type { Env } from "../types/env";
import type { SendEmailRequest } from "../types/email";
import {
  sendTransactionalEmail,
  validateBodyField,
  validateEmail,
  validateSubject,
} from "../lib/email";
import { jsonError, jsonSuccess } from "../utils/response";

const emailRoutes = new Hono<{ Bindings: Env }>();

emailRoutes.post("/send", async (c) => {
  let body: SendEmailRequest;
  try {
    body = await c.req.json<SendEmailRequest>();
  } catch {
    return jsonError(c, "Invalid JSON body", "INVALID_BODY");
  }

  const to = validateEmail(body.to);
  if (!to) {
    return jsonError(c, "Missing or invalid field: to", "INVALID_TO");
  }

  const subject = validateSubject(body.subject);
  if (!subject) {
    return jsonError(c, "Missing or invalid field: subject", "INVALID_SUBJECT");
  }

  const text = validateBodyField(body.text) ?? undefined;
  const html = validateBodyField(body.html) ?? undefined;
  if (!text && !html) {
    return jsonError(c, "Provide text and/or html body content", "MISSING_BODY");
  }

  try {
    const result = await sendTransactionalEmail(c.env, { to, subject, text, html });
    return jsonSuccess(c, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return jsonError(c, message, "SEND_ERROR", 502);
  }
});

export default emailRoutes;
