import { SUBMISSIONS_PAGE_SIZE } from "../constants/defaults";
import type { FormFields, FormRow, SubmissionRow } from "../types/form";

const FORM_COLUMNS = "id, owner_email, allowed_origin, redirect_url, created_at";

export async function createForm(
  db: D1Database,
  form: { id: string; ownerEmail: string; allowedOrigin: string | null; redirectUrl: string | null }
): Promise<FormRow> {
  const row = await db
    .prepare(
      `INSERT INTO forms (id, owner_email, allowed_origin, redirect_url) VALUES (?, ?, ?, ?) RETURNING ${FORM_COLUMNS}`
    )
    .bind(form.id, form.ownerEmail, form.allowedOrigin, form.redirectUrl)
    .first<FormRow>();
  if (!row) throw new Error("Failed to create form");
  return row;
}

export async function getForm(db: D1Database, id: string): Promise<FormRow | null> {
  return db.prepare(`SELECT ${FORM_COLUMNS} FROM forms WHERE id = ?`).bind(id).first<FormRow>();
}

export async function insertSubmission(
  db: D1Database,
  submission: {
    formId: string;
    fields: FormFields;
    ipHash: string | null;
    userAgent: string | null;
  }
): Promise<number> {
  const row = await db
    .prepare(
      "INSERT INTO submissions (form_id, fields, ip_hash, user_agent) VALUES (?, ?, ?, ?) RETURNING id"
    )
    .bind(
      submission.formId,
      JSON.stringify(submission.fields),
      submission.ipHash,
      submission.userAgent
    )
    .first<{ id: number }>();
  if (!row) throw new Error("Failed to store submission");
  return row.id;
}

export async function listSubmissions(db: D1Database, formId: string): Promise<SubmissionRow[]> {
  const result = await db
    .prepare(
      "SELECT id, form_id, fields, ip_hash, user_agent, created_at FROM submissions WHERE form_id = ? ORDER BY id DESC LIMIT ?"
    )
    .bind(formId, SUBMISSIONS_PAGE_SIZE)
    .all<SubmissionRow>();
  return result.results ?? [];
}
