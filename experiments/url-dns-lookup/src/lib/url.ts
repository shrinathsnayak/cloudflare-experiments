import { ALLOWED_SCHEMES } from "../constants/defaults";

/**
 * Validates URL and returns the hostname (for DNS lookup) or null if invalid.
 */
export function getHostnameFromUrl(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!ALLOWED_SCHEMES.includes(url.protocol as (typeof ALLOWED_SCHEMES)[number])) {
      return null;
    }
    const hostname = url.hostname;
    return hostname || null;
  } catch {
    return null;
  }
}
