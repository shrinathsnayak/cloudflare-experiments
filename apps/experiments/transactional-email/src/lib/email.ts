import {
  DEFAULT_FROM_EMAIL,
  EMAIL_PATTERN,
  MAX_BODY_LENGTH,
  MAX_SUBJECT_LENGTH,
} from "../constants/defaults";
import type { Env } from "../types/env";
import type { SendEmailRequest, SendEmailResponse } from "../types/email";

export function validateEmail(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!EMAIL_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateSubject(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_SUBJECT_LENGTH) return null;
  return trimmed;
}

export function validateBodyField(input: string | undefined): string | null {
  if (input === undefined || input === null) return null;
  if (typeof input !== "string") return null;
  if (!input.trim() || input.length > MAX_BODY_LENGTH) return null;
  return input;
}

export async function sendTransactionalEmail(
  env: Env,
  request: Required<Pick<SendEmailRequest, "to" | "subject">> &
    Pick<SendEmailRequest, "text" | "html">
): Promise<SendEmailResponse> {
  const from = env.FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
  const result = await env.EMAIL.send({
    from,
    to: request.to,
    subject: request.subject,
    text: request.text,
    html: request.html,
  });

  return {
    sent: true,
    to: request.to,
    subject: request.subject,
    messageId: result.messageId,
  };
}
