import { ALLOWED_SCHEMES } from "../constants/defaults";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseHttpUrl(input: string | undefined): URL | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return ALLOWED_SCHEMES.includes(url.protocol as (typeof ALLOWED_SCHEMES)[number]) ? url : null;
  } catch {
    return null;
  }
}

export function validateUrl(input: string | undefined): string | null {
  return parseHttpUrl(input)?.href ?? null;
}

/** Normalizes to `scheme://host[:port]` so it can be compared with the Origin header. */
export function validateOrigin(input: string | undefined): string | null {
  return parseHttpUrl(input)?.origin ?? null;
}

export function validateEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return EMAIL_PATTERN.test(trimmed) ? trimmed.toLowerCase() : null;
}
