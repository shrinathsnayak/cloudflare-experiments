const DOMAIN_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/**
 * Validates a bare domain name (no scheme or path).
 */
export function validateDomain(input: string | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase().replace(/\.$/, "");
  if (!trimmed || trimmed.includes("://") || trimmed.includes("/")) return null;
  if (!DOMAIN_REGEX.test(trimmed)) return null;
  return trimmed;
}
