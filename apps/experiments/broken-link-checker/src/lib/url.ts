import { ALLOWED_SCHEMES, DEFAULT_LINK_LIMIT, MAX_LINK_LIMIT } from "../constants/defaults";

/**
 * Validates and normalizes a URL for safe fetching.
 */
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

export function parseLimit(input: string | undefined): number {
  if (!input) return DEFAULT_LINK_LIMIT;
  const n = Number.parseInt(input, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LINK_LIMIT;
  return Math.min(n, MAX_LINK_LIMIT);
}
