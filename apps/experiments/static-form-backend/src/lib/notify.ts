import { DEFAULT_FROM_EMAIL } from "../constants/defaults";
import type { Env } from "../types/env";
import type { FormFields, FormRow } from "../types/form";
import { validateEmail } from "./url";

export function buildSubmissionEmail(
  form: Pick<FormRow, "id" | "allowed_origin">,
  fields: FormFields
): { subject: string; text: string } {
  const source = form.allowed_origin ?? `form ${form.id}`;
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${value}`);
  return {
    subject: `New submission on ${source}`,
    text: [
      `New submission for form ${form.id}:`,
      "",
      ...(lines.length ? lines : ["(no fields)"]),
      "",
      "Sent by the static-form-backend experiment.",
    ].join("\n"),
  };
}

/** Never throws: the submission is already stored, so a mail failure should not fail the request. */
export async function notifyOwner(env: Env, form: FormRow, fields: FormFields): Promise<boolean> {
  const { subject, text } = buildSubmissionEmail(form, fields);
  const replyTo = validateEmail(fields.email);
  try {
    await env.EMAIL.send({
      from: env.FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL,
      to: form.owner_email,
      subject,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    return true;
  } catch (error) {
    console.error(`Failed to email owner of form ${form.id}`, error);
    return false;
  }
}
