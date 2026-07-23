import { ALLOWED_SCHEMES } from "../constants/defaults";

const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * Accept a bare domain or http(s) URL and return a normalized hostname.
 */
export function validateDomain(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  try {
    if (trimmed.includes("://")) {
      const url = new URL(trimmed);
      if (!ALLOWED_SCHEMES.includes(url.protocol as (typeof ALLOWED_SCHEMES)[number])) {
        return null;
      }
      const host = url.hostname.replace(/\.$/, "");
      return DOMAIN_RE.test(host) ? host : null;
    }

    const host = trimmed.replace(/^@/, "").replace(/\.$/, "");
    if (host.includes("/") || host.includes(" ") || host.includes(":")) return null;
    return DOMAIN_RE.test(host) ? host : null;
  } catch {
    return null;
  }
}
