import {
  HONEYPOT_FIELD,
  MAX_FIELD_LENGTH,
  MAX_FIELD_NAME_LENGTH,
  MAX_FIELDS,
  TURNSTILE_FIELD,
} from "../constants/defaults";
import type { FormFields, ParseResult } from "../types/form";

type Entry = [string, string];

function invalid(message: string): ParseResult {
  return { ok: false, code: "INVALID_BODY", message, status: 400 };
}

async function readEntries(request: Request): Promise<Entry[] | ParseResult> {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();

  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return invalid("Invalid JSON body");
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return invalid("JSON body must be an object of fields");
    }
    const entries: Entry[] = [];
    for (const [key, value] of Object.entries(body)) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") {
          return invalid(`Field "${key}" must be a string, number, or boolean`);
        }
        entries.push([key, String(v)]);
      }
    }
    return entries;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return invalid("Malformed form body");
    }
    const entries: Entry[] = [];
    form.forEach((value, key) => {
      if (typeof value === "string") entries.push([key, value]);
    });
    return entries;
  }

  return {
    ok: false,
    code: "UNSUPPORTED_CONTENT_TYPE",
    message: "Use application/x-www-form-urlencoded, multipart/form-data, or application/json",
    status: 415,
  };
}

/** Text fields only: file parts in multipart bodies are dropped. Repeated keys are joined with ", ". */
export async function parseSubmission(request: Request): Promise<ParseResult> {
  const entries = await readEntries(request);
  if (!Array.isArray(entries)) return entries;

  const fields: FormFields = {};
  let turnstileToken: string | null = null;
  let honeypotFilled = false;

  for (const [rawKey, value] of entries) {
    const key = rawKey.trim();
    if (key === TURNSTILE_FIELD) {
      turnstileToken = value.trim() || null;
      continue;
    }
    if (key === HONEYPOT_FIELD) {
      honeypotFilled ||= value.trim() !== "";
      continue;
    }
    if (!key || key.length > MAX_FIELD_NAME_LENGTH) {
      return {
        ok: false,
        code: "INVALID_FIELD_NAME",
        message: `Field names must be 1-${MAX_FIELD_NAME_LENGTH} characters`,
        status: 400,
      };
    }
    const next = key in fields ? `${fields[key]}, ${value}` : value;
    if (next.length > MAX_FIELD_LENGTH) {
      return {
        ok: false,
        code: "FIELD_TOO_LONG",
        message: `Field "${key}" exceeds ${MAX_FIELD_LENGTH} characters`,
        status: 400,
      };
    }
    fields[key] = next;
    if (Object.keys(fields).length > MAX_FIELDS) {
      return {
        ok: false,
        code: "TOO_MANY_FIELDS",
        message: `Submissions are limited to ${MAX_FIELDS} fields`,
        status: 400,
      };
    }
  }

  return { ok: true, fields, turnstileToken, honeypotFilled };
}
