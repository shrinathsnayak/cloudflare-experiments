import { ALLOWED_SCHEMES } from "../constants/defaults";

/**
 * Normalizes input to a full URL (e.g. "example.com" -> "https://cloudflare.com").
 */
function normalizeInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Validates and normalizes a URL for safe fetching.
 * Accepts host-only input (e.g. example.com) and prepends https.
 * Returns the URL string or null if invalid/not allowed.
 */
export function validateUrl(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const normalized = normalizeInput(input);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    if (!ALLOWED_SCHEMES.includes(url.protocol as (typeof ALLOWED_SCHEMES)[number])) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}
