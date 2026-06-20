import { ALLOWED_SCHEMES } from "../constants/defaults";

export function validateUrl(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!ALLOWED_SCHEMES.includes(url.protocol as (typeof ALLOWED_SCHEMES)[number])) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export function shouldRetryWithGet(status: number): boolean {
  return status === 405 || status === 501;
}
